# Admin frontend (Phase 8)

The admin console lives at `/admin/*` in `apps/frontend`. It reuses the
Phase 7 auth + session machinery, but adds its own data layer, hooks,
and chrome so the storefront stays uncluttered.

```
apps/frontend/src
├── app/(admin)/admin/                     # route group + pages
│   ├── layout.tsx                         # AdminGuard + sidebar + topbar
│   ├── page.tsx                           # /admin (dashboard)
│   ├── products/
│   │   ├── page.tsx                       # list + filters
│   │   ├── new/page.tsx                   # create form
│   │   └── [id]/page.tsx                  # edit form
│   ├── categories/page.tsx
│   ├── brands/page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── coupons/page.tsx
│   ├── reviews/page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── audit/page.tsx
│   └── settings/page.tsx
├── components/admin/                      # admin-only UI
└── lib/
    ├── api/admin-types.ts                 # contracts
    ├── api/admin-mock-data.ts             # seeded fixtures + analytics
    ├── api/admin-mock-backend.ts          # client-only admin backend
    ├── api/index.ts                       # api.admin facade
    └── hooks/use-admin.ts                 # TanStack Query hooks
```

## Architecture

```
React component
    │
    ▼
useAdmin* hook (TanStack Query)
    │
    ▼
api.admin.* facade  ─►  NEXT_PUBLIC_USE_MOCK_API
                       │
                       ├── true  ─► adminMockBackend.*  (localStorage)
                       └── false ─► authedApi.*         (real Express API)
```

The admin facade mirrors the Express `/admin/*` and module-scoped
admin routes (`/catalog/admin/*`, `/orders/admin/all`,
`/coupons/admin`, `/reviews/admin/*`). Switching to the real backend is
a single env-var change — no component edits required.

## Mock backend

`lib/api/admin-mock-backend.ts` implements the admin contract in the
browser and persists state to `localStorage` keys prefixed
`twinspire.admin.*`. It is seeded from:

- The Phase 6 catalog (`@/data/products`, `categories`, `brands`).
- `admin-mock-data.ts`, which generates ten extra orders across eight
  customers, six coupons (active / paused / expired), six moderation
  reviews, an audit log, and an analytics summary derived from the live
  order data.

Reset the data at any time via the **Settings** page or from devtools:

```ts
import { adminMockBackend } from '@/lib/api/admin-mock-backend';
await adminMockBackend._reset();
```

## Authentication + roles

`mock-backend.ensureSeeded()` automatically creates two staff accounts:

| Email                    | Role    | Password           | 2FA |
| ------------------------ | ------- | ------------------ | --- |
| `admin@twinspire.dev`    | admin   | `TwinSpire!2026`   | yes |
| `manager@twinspire.dev`  | manager | `TwinSpire!2026`   | yes |

Both accounts have 2FA enabled; any 6-digit code passes the mock TOTP
check.

`AdminGuard` enforces three rules on every `/admin/*` route:

1. While the session is hydrating it renders a centered spinner.
2. Guests are redirected to `/login?returnTo=<original-path>`.
3. Signed-in customers see an accessible 403 panel with links back to
   the storefront and their account.

The storefront avatar dropdown (`components/layout/account-menu.tsx`)
also adds an "Admin console" entry whenever the signed-in user is in
the staff role set (`admin | superadmin | manager | staff | support`).

### Role matrix

| Action                          | manager | admin | superadmin |
| ------------------------------- | :-----: | :---: | :--------: |
| View any admin page             |    ✓    |   ✓   |     ✓      |
| Create / edit products          |    ✓    |   ✓   |     ✓      |
| Delete products                 |    ✗    |   ✓   |     ✓      |
| Manage categories / brands      |    ✓    |   ✓   |     ✓      |
| Delete category / brand         |    ✗    |   ✓   |     ✓      |
| Update orders / fulfilment      |    ✓    |   ✓   |     ✓      |
| Refund orders                   |    ✗    |   ✓   |     ✓      |
| Create / edit coupons           |    ✓    |   ✓   |     ✓      |
| Delete coupons                  |    ✗    |   ✓   |     ✓      |
| Moderate reviews                |    ✓    |   ✓   |     ✓      |
| Delete reviews                  |    ✗    |   ✓   |     ✓      |
| Suspend / role-change customers |    ✗    |   ✓   |     ✓      |

The same matrix is enforced inside `adminMockBackend` via
`requireRole(...)`, so the UI cannot bypass it by skipping the
mutation hooks.

## State management

- **TanStack Query** caches every list and detail call, with shared
  query keys exported from `lib/hooks/use-admin.ts` so any mutation can
  invalidate the relevant subtree.
- All list hooks set `placeholderData: previous` for paginated
  navigation without flicker.
- Mutations show toast notifications via Sonner.

## Routing notes

- `/admin` is the dashboard. The sidebar `Overview` group contains a
  single link by design — analytics, alerts, and recent activity are
  composed inline.
- `/admin/orders?status=processing` and
  `/admin/products?lowStock=1` are deep-linked from the dashboard
  alerts.
- The Products list reads `useSearchParams`; the page wraps the
  component in `<Suspense fallback={null}>` to satisfy Next.js 15's
  `useSearchParams` rendering rule.
- `/admin/*` is disallowed in `robots.txt` (set in Phase 6).

## Manual test plan

1. Sign out of any existing session.
2. Sign in as `admin@twinspire.dev` / `TwinSpire!2026` and use any
   6-digit TOTP when prompted.
3. Visit `/admin` — the dashboard should show KPI tiles, a 30-day
   chart with Revenue/Orders tabs, recent orders, an attention card,
   and an audit feed.
4. Open `/admin/products`, create a new product with the demo image,
   confirm the audit log records `product.create`, then sign out and
   sign in as `manager@twinspire.dev`. Verify the delete button is
   disabled with a "Only admins can delete products" message.
5. Open the most recent order under `/admin/orders`, change its
   fulfilment status, add a tracking number, and confirm the timeline
   reflects the change.
6. As admin, refund the same order via the dialog; confirm the order
   status flips to `refunded` and the audit log shows `order.refund`
   with the amount metadata.
7. From `/admin/reviews?status=pending`, approve one review and reject
   another with a moderator note. Verify counts update across tabs.
8. From `/admin/customers/<demo customer id>`, suspend the customer.
   Sign in as that customer (`demo@twinspire.dev` /
   `TwinSpire!2026`)  — login should still succeed because suspension
   is informational in the mock; rotate them back to `active`.

## Switching to the real API

1. Implement the corresponding Express endpoints (the existing
   `/orders/admin/all`, `/catalog/admin/*`, `/coupons/admin`, and
   `/reviews/admin/*` routes already exist; Phase 9 adds
   `/admin/{analytics,customers,audit}`).
2. Set `NEXT_PUBLIC_USE_MOCK_API=false` in the frontend `.env.local`
   (or remove the variable — defaults to `true` for Phase 8).
3. Restart `pnpm dev`. Every `useAdmin*` hook will now talk to the
   real backend via `authedApi`, with bearer token + refresh handled
   by the Phase 7 client.

## Tests

- `apps/frontend/src/lib/api/admin-mock-backend.test.ts` — 11
  contract tests covering auth gating, product CRUD with delete
  gating, order updates + refund gating, coupon uniqueness, review
  moderation, and customer status / role updates.
- Combined with the Phase 7 mock-backend tests and auth schema tests
  the frontend suite is currently 32 tests across 3 suites; run via
  `pnpm --filter @twinspire/frontend test`.
