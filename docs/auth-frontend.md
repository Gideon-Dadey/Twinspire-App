# Auth & account frontend

This document maps the Phase 7 surface — every auth page, the account
dashboard, and the wiring that ties them to the backend in
`apps/backend/src/modules/{auth,users,orders,wishlist}`.

## Architecture

```
+---------------------+     +----------------------+     +-----------------------+
| React component     | --> | TanStack Query hooks | --> | api facade            |
| (forms / dashboard) |     | (lib/hooks/*)        |     | (lib/api/index.ts)    |
+---------------------+     +----------------------+     +----------+------------+
                                                                    |
                              NEXT_PUBLIC_USE_MOCK_API decides       v
                                                  +-----------------+-----------------+
                                                  |                                   |
                                          true (default)                       false (prod)
                                                  |                                   |
                                                  v                                   v
                                  +-----------------------------+   +-------------------------------+
                                  | mock-backend.ts (localStorage)|   | authedApi -> /api/v1/auth/... |
                                  +-----------------------------+   +-------------------------------+
```

- Components never call `fetch` directly. They depend on TanStack
  Query hooks, which depend on `api` in `lib/api/index.ts`.
- `api` chooses between the mock backend and the real Express API
  based on `NEXT_PUBLIC_USE_MOCK_API`. Both implementations honour the
  same TypeScript contracts in `lib/api/types.ts`, which themselves
  mirror the zod schemas in `apps/backend/src/modules/*/(*.schemas.ts)`.
- The mock backend exists so Phase 7 ships fully usable while the
  backend env (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
  `COOKIE_SECRET`, Mongo, Redis) is being wired locally. Switch to the
  real API by setting `NEXT_PUBLIC_USE_MOCK_API=false` in
  `apps/frontend/.env.local`.

## Demo credentials (mock backend only)

| Field    | Value                |
| -------- | -------------------- |
| Email    | `demo@twinspire.dev` |
| Password | `TwinSpire!2026`     |

This user ships with three orders, two addresses (Portland is default),
and a 5-item wishlist. Register/social flows create additional users
in `localStorage`.

## Public auth routes

Every auth route lives under the `(auth)` route group with its own
two-column layout (`apps/frontend/src/app/(auth)/layout.tsx`) and is
excluded from indexing via per-page `robots`.

| Path               | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `/login`           | Email + password, social buttons, auto-prompts for 2FA when challenged. |
| `/register`        | New account, password strength meter, terms gate, auto sign-in.         |
| `/forgot-password` | Sends a reset link (idempotent UX — always reports success).            |
| `/reset-password`  | Consumes `?token=…` and sets a new password.                            |
| `/verify-email`    | Consumes `?token=…` and flips the user to active.                       |

## Account dashboard

All authenticated surfaces live under `(shop)/account/*` and share an
`AuthGuard` + sticky sidebar layout
(`apps/frontend/src/app/(shop)/account/layout.tsx`).

| Path                       | Purpose                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `/account`                 | Greeting + stat tiles (orders, lifetime spend, wishlist, addresses) + recent orders. |
| `/account/orders`          | Filterable, paginated order list with status badges.                                 |
| `/account/orders/[id]`     | Items, totals, timeline, shipping/billing/payment, cancel dialog, invoice button.    |
| `/account/wishlist`        | Persistent wishlist, clear-all dialog, deep links to PDP.                            |
| `/account/addresses`       | Address CRUD + default selector with dialogs.                                        |
| `/account/profile`         | Name, display name, phone, avatar URL.                                               |
| `/account/preferences`     | Locale, currency, theme, marketing + newsletter switches.                            |
| `/account/security`        | Change password, 2FA enable/disable with backup codes, active sessions + revoke.     |
| `/account/payment-methods` | Reserved for Phase 8 wallets.                                                        |

## Header / shop integration

- `components/layout/header.tsx` now renders `<AccountMenu>` (avatar
  dropdown for signed-in users, "Sign in" CTA for guests).
- `components/shared/product-card.tsx` and the wishlist heart on the
  PDP toggle the persistent backend wishlist. Guests are prompted to
  sign in (`returnTo` preserved); authenticated users see optimistic
  updates via TanStack Query.
- `components/shop/checkout/checkout-flow.tsx` pre-fills the shipping
  form from the user's default address and surfaces a hint linking to
  `/account/addresses`.

## State management

| Concern                | Where                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| Access token (memory)  | `lib/api/access-token.ts`                                          |
| Refresh token (cookie) | Set by the backend; never read by the frontend                     |
| User profile + status  | Zustand `useAuthStore` (`lib/stores/auth-store.ts`)                |
| Server data caches     | TanStack Query (`lib/hooks/use-*.ts`)                              |
| Cart                   | Existing Zustand `cart-store` (Phase 6) — unchanged                |

The single `SessionProvider` in `AppProviders` calls `bootstrap()` on
mount, which hits `api.auth.me()` and seeds the store.

## Switching to the real backend

1. Start Mongo + Redis (or point env vars at managed instances) and
   ensure the backend boots clean. The repo's `.env.example` lists
   every secret.
2. In `apps/frontend/.env.local` set `NEXT_PUBLIC_USE_MOCK_API=false`.
3. Restart `pnpm dev`.

All hooks resolve through `authedApi` instead of `mockBackend`. The
shape of every response is identical, so component code is unchanged.

## Adding a new authenticated endpoint

1. Add the contract to `lib/api/types.ts`.
2. Implement against the real backend in `lib/api/index.ts` (use
   `authedApi.get/post/...`).
3. Implement against the mock backend in `lib/api/mock-backend.ts`
   (persist anything stateful via `mock-storage.ts`).
4. Add a TanStack Query hook in `lib/hooks/use-*.ts`.
5. Consume it from a component.

The mock backend deliberately mirrors backend errors (`HttpError`
codes such as `WEAK_PASSWORD`, `TOTP_REQUIRED`, `INVALID_CREDENTIALS`)
so component error-handling logic doesn't need to be re-written when
flipping `NEXT_PUBLIC_USE_MOCK_API`.

## Testing the flow manually

1. Visit `/login` and use the demo credentials.
2. From the dashboard, open any order to see the timeline.
3. Open `/account/security`, enable 2FA, sign out, sign back in — the
   login form should now ask for a 6-digit code (any 6 digits work in
   the mock).
4. Add a new address; visit `/checkout` with a cart — the shipping form
   should be pre-filled.
5. Heart any product on the homepage — it should appear in
   `/account/wishlist` immediately.

To reset the demo data, run in the browser console:

```js
window.localStorage.clear();
location.reload();
```
