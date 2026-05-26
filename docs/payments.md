# Payments — Stripe + PayPal

## Architecture

```
   Client (Next.js)        Backend                       Stripe / PayPal
   ───────────────         ───────                       ───────────────
   POST /orders   ───────► place order
                           ├─ create Payment row
                           ├─ create PaymentIntent ─────► PaymentIntent
                           │  or PayPal Order  ─────────► PayPal Order
                           ▼
                          200 { order, paymentSession }
   confirm via Stripe SDK ──────────────────────────────► capture
                                  webhook ──────────────► ↩
                           ◄──── update Payment & Order ─────
```

Every payment lifecycle event lands in MongoDB through a webhook handler so
the order's `paymentStatus` and `status` stay authoritative even if the user
abandons the browser tab.

## Providers

### Stripe

* Library: `stripe@17.x`, pinned to API version `2024-10-28.acacia`.
* `STRIPE_SECRET_KEY` enables real flows; without it the service runs in
  **stub mode** and still creates `Payment` rows so end-to-end tests work.
* Webhook endpoint: `POST /api/v1/webhooks/stripe`. Mounted *before*
  `applySecurity()` so the raw body is preserved for signature verification
  using `STRIPE_WEBHOOK_SECRET`.
* Handled events:
  * `payment_intent.succeeded` → mark payment `succeeded`, order `paid`
  * `payment_intent.payment_failed` → mark payment/order `failed`
  * `charge.refunded` → mark `refunded` or `partially_refunded`

### PayPal

* Direct REST calls to `https://api-m.sandbox.paypal.com` (or live).
* `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` enable real flows; otherwise
  stub mode.
* Webhook endpoint: `POST /api/v1/webhooks/paypal`. Structural payload check
  only (signature verification requires the PayPal verify-webhook-signature
  call — left as a TODO with `PAYPAL_WEBHOOK_ID`).
* Handled events:
  * `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED` → mark succeeded
  * `PAYMENT.CAPTURE.DENIED`, `CHECKOUT.ORDER.VOIDED` → mark failed

## Endpoints

| Method | Path                                | Description                                     |
| ------ | ----------------------------------- | ----------------------------------------------- |
| GET    | `/payments/config`                  | Returns whether each provider is configured + PayPal `clientId` |
| GET    | `/payments/:paymentId`              | Get a payment owned by the current user         |
| POST   | `/webhooks/stripe`                  | Stripe webhook (raw body)                       |
| POST   | `/webhooks/paypal`                  | PayPal webhook                                  |

The order-related refund endpoint lives under
`POST /orders/admin/all/:orderId/refund` (admin only).

## Idempotency

* `placeOrder` accepts an `idempotencyKey` query/body param. The result is
  cached for 1 hour. Replays return the same order/payment session.
* `recordPaymentSuccess` is naturally idempotent — re-applying a `paid` event
  is a no-op because the order's `paymentStatus === 'captured'` guard returns
  the existing order.

## Refunds

`POST /orders/admin/all/:orderId/refund` accepts an optional partial amount.

* **Stripe** — calls `stripe.refunds.create({ payment_intent, amount })`.
  Records the refunded amount on the `Payment` document.
* **PayPal** — capture refunds happen via PayPal's own dashboard or REST
  capture-refund call; the backend updates internal state via the same
  refund endpoint.
* **Stub mode** — internal state is updated without a remote call.

In all cases the order is transitioned to `refunded` (or
`partially_refunded`) and the action is recorded via `auditService` as a
`refund` event.

## Failure modes

| Failure                                  | Surface                       |
| ---------------------------------------- | ----------------------------- |
| Cart empty / stock insufficient          | 400 / 409 on `POST /orders`   |
| Bad coupon                               | 400 on `POST /cart/coupons`   |
| Concurrent submission                    | 409 (`CONFLICT`)              |
| Provider not configured                  | Stub mode (no client error)   |
| Webhook signature mismatch (Stripe)      | 400 with logged warning       |
| Provider API failure                     | 503 `SERVICE_UNAVAILABLE`     |

## Env variables

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_API_VERSION=2024-10-28.acacia

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox|live
PAYPAL_WEBHOOK_ID=

TAX_RATE_DEFAULT=0
FREE_SHIPPING_THRESHOLD=75
SHIPPING_FLAT_RATE=8.99
ORDER_CART_TTL_DAYS=30
GUEST_CART_COOKIE=ts_cart
```
