# Commerce — Cart, Coupons, Orders

The commerce stack is composed of three independent but related modules.
This document covers the data flow end-to-end.

```
                  +-------------+        +----------+        +---------+
                  |   Cart      |  ----> | Coupons  |  ----> | Pricing |
                  |  (Mongo)    |        | (Mongo)  |        | engine  |
                  +-------------+        +----------+        +---------+
                         |                                       |
                         v                                       v
                  +-------------+         quote / checkout       |
                  |   Orders    |  <----------------------------+
                  +-------------+
                         |
                         v
                  +-------------+
                  |  Payments   |
                  +-------------+
```

## Cart (`/api/v1/cart`)

### Identity model

* **Authenticated users** — cart is keyed on `userId`.
* **Guests** — cart is keyed on a signed cookie `ts_cart`. The cookie is
  HttpOnly, `Lax`, signed, and expires after `ORDER_CART_TTL_DAYS` (default 30
  days). On the first cart write the cookie is automatically generated.

The cart middleware uses `optionalAuthenticate`, so a single Express route
serves both audiences.

### Endpoints

| Method | Path                          | Notes                              |
| ------ | ----------------------------- | ---------------------------------- |
| GET    | `/cart`                       | Returns the current cart           |
| POST   | `/cart/items`                 | Add product (auto-coalesces lines) |
| PATCH  | `/cart/items/:itemId`         | Set quantity (0 to remove)         |
| DELETE | `/cart/items/:itemId`         | Remove a line                      |
| DELETE | `/cart`                       | Clear the cart                     |
| POST   | `/cart/coupons`               | Apply a coupon                     |
| DELETE | `/cart/coupons/:code`         | Remove a coupon                    |

### Totals

Every mutation re-runs the pricing engine and persists the result in
`cart.totals`:

```json
{
  "subtotal":  { "amount": 0, "currency": "USD" },
  "discount":  { "amount": 0, "currency": "USD" },
  "shipping":  { "amount": 0, "currency": "USD" },
  "tax":       { "amount": 0, "currency": "USD" },
  "total":     { "amount": 0, "currency": "USD" },
  "itemCount": 0
}
```

### Merging guest carts on login

`POST /auth/login` and `POST /auth/social/callback` both call
`cartService.mergeGuestIntoUser(sessionId, userId)`:

* For each guest item, if the user already has the same `productId`/`variantId`
  the quantities are summed (capped at 99).
* Otherwise the item is moved onto the user cart.
* Coupon codes from both carts are unioned.
* The guest cart is deleted afterwards.

This is fire-and-forget — failures never block login.

## Coupons (`/api/v1/coupons`)

### Coupon types

| Type            | Behaviour                                                                          |
| --------------- | ---------------------------------------------------------------------------------- |
| `percentage`    | `value`% off the eligible subtotal (capped by `maxDiscount` if set)                |
| `fixed`         | Flat amount off the eligible subtotal                                              |
| `free_shipping` | Sets shipping to 0 regardless of subtotal                                          |
| `bogo`          | Half off the cheaper of every two eligible units (Buy-One-Get-One)                 |

### Eligibility checks

* `isActive`, `startsAt`, `expiresAt`
* `usageLimit` — global ceiling
* `usageLimitPerUser` — per-user ceiling (looks up `Order.couponCodes`)
* `minSubtotal`
* `firstOrderOnly`
* `applicable{Product,Brand,Category}Ids` (whitelist)
* `excludedProductIds` (blacklist)
* `stackable` — non-stackable coupons short-circuit further applications

### Endpoints

| Method | Path                                  | Auth         |
| ------ | ------------------------------------- | ------------ |
| POST   | `/coupons/validate`                   | optional     |
| GET    | `/coupons/admin`                      | manager+     |
| GET    | `/coupons/admin/:couponId`            | manager+     |
| POST   | `/coupons/admin`                      | manager+     |
| PATCH  | `/coupons/admin/:couponId`            | manager+     |
| DELETE | `/coupons/admin/:couponId`            | admin        |

Once a coupon has been redeemed (`usedCount > 0`) deleting it instead flips
`isActive` to false to preserve historical references.

## Pricing engine

All money math runs through `services/pricing/pricing.service.ts`. The engine
is pure, deterministic, and never trusts client-provided numbers:

1. Compute `subtotal` from `unitPriceAmount × quantity`.
2. For each coupon code (in order):
   * Run eligibility checks.
   * Compute discount; reject if it has no effect.
   * Push into `appliedCoupons`; stop if non-stackable.
3. Clamp `discount ≤ subtotal`.
4. Shipping — free when subtotal ≥ `FREE_SHIPPING_THRESHOLD` or a
   free-shipping coupon applied; otherwise `SHIPPING_FLAT_RATE`.
5. Tax — `subtotalAfterDiscount × TAX_RATE_DEFAULT` (a country-aware tax
   provider can swap in later).
6. `total = subtotal − discount + shipping + tax`, rounded to 2 decimals.

The engine also exposes `validateCoupon(code, ctx)` so the storefront can
preview a coupon without modifying state.

## Orders (`/api/v1/orders`)

### Lifecycle

```
   pending ─► awaiting_payment ─► paid ─► processing ─► shipped ─► delivered ─► completed
       │              │              │           │            │            │
       ▼              ▼              ▼           ▼            ▼            ▼
   cancelled      cancelled       cancelled   cancelled    on_hold      refunded
       │              │              │
       ▼              ▼              ▼
     failed         failed       refunded
```

Transitions are guarded by an explicit `ALLOWED_TRANSITIONS` map; an invalid
transition produces a 400 `INVALID_TRANSITION` error.

### Endpoints

| Method | Path                                  | Auth      | Notes                                |
| ------ | ------------------------------------- | --------- | ------------------------------------ |
| POST   | `/orders/quote`                       | optional  | Server-priced quote (no side effects) |
| POST   | `/orders`                             | optional  | Place order (idempotent)             |
| GET    | `/orders`                             | required  | List the current user's orders       |
| GET    | `/orders/:orderId`                    | required  | Get a single user-owned order        |
| POST   | `/orders/:orderId/cancel`             | required  | Cancel while pending/awaiting_payment |
| GET    | `/orders/admin/all`                   | manager+  | Admin listing with filters           |
| GET    | `/orders/admin/all/:orderId`          | manager+  | Admin detail                         |
| PATCH  | `/orders/admin/all/:orderId`          | manager+  | Status / tracking / fulfillment      |
| POST   | `/orders/admin/all/:orderId/refund`   | admin     | Refund (Stripe/Stub/PayPal)          |

### Place order semantics

* Cart cannot be empty.
* Guest orders require `guestEmail`.
* Each line is stock-checked against `Product.stockStatus` (or
  `variant.stock - variant.reservedStock` for variant lines). A failure raises
  `INSUFFICIENT_STOCK` (409).
* A **distributed lock** keyed on `cart._id` prevents two concurrent submits
  from both creating orders.
* When provided, `idempotencyKey` is cached in Redis for 1 hour against the
  resulting `orderId`. Replays return the same order without re-deducting
  inventory.
* On success the cart is wiped and coupon `usedCount` is incremented.
* The handler returns both the new order and a freshly created
  `paymentSession` (see `payments.md`).
