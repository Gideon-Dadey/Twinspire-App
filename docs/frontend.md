# Frontend architecture

The TwinSpire web client is a Next.js 15 App Router application that consumes
the design system in `@twinspire/ui` and shared utilities from
`@twinspire/utils` / `@twinspire/types`. Phase 6 wired up every public
customer-facing surface on top of a local mock catalog so the UX can ship
ahead of the API integration in later phases.

## Tech stack

| Concern              | Tool                                                  |
| -------------------- | ----------------------------------------------------- |
| Framework            | Next.js 15 (App Router, RSC, Turbopack)               |
| UI library           | `@twinspire/ui` (Radix + Tailwind + CVA + Framer)     |
| State (client)       | Zustand + `persist`                                   |
| Forms                | `react-hook-form` + `zod` (`@hookform/resolvers/zod`) |
| Data fetching        | TanStack Query (wired; awaiting Phase 7 endpoints)    |
| Toasts               | `sonner` via `@twinspire/ui/Toaster`                  |
| Icons                | `lucide-react`                                        |
| Markdown             | Hand-rolled renderer (`components/blog/markdown.tsx`) |
| Images               | `next/image`                                          |
| Links                | `next/link` (injected via adapter components)         |
| Testing              | Playwright (e2e) configured in `apps/frontend`        |

## Directory layout

```
apps/frontend/src/
├── app/
│   ├── (shop)/                  ← public route group (shares layout)
│   │   ├── layout.tsx           ← PromoBar + Header + Footer + CartDrawer
│   │   ├── page.tsx             ← homepage
│   │   ├── [category]/          ← /phones, /laptops, /tvs, /audio, /gaming, /accessories
│   │   ├── products/[slug]/     ← PDP
│   │   ├── search/              ← /search?q=...
│   │   ├── cart/                ← /cart
│   │   ├── checkout/            ← /checkout (3-step) + /checkout/success
│   │   ├── blog/                ← index + /blog/[slug]
│   │   ├── brands/              ← index + /brands/[slug]
│   │   ├── categories/
│   │   ├── deals/ best-sellers/ new-arrivals/
│   │   ├── account/ wishlist/
│   │   ├── help/[topic]/        ← faq, shipping, returns, warranty, contact
│   │   ├── legal/[doc]/         ← privacy, terms, cookies, accessibility
│   │   └── about/ careers/ press/ sustainability/ stores/
│   ├── sitemap.ts               ← static + dynamic URLs
│   ├── robots.ts                ← blocks /cart, /checkout, /search
│   ├── manifest.ts
│   ├── error.tsx / not-found.tsx / loading.tsx
│   └── layout.tsx               ← html shell, Providers, fonts
│
├── components/
│   ├── blog/                    ← markdown renderer, TOC, BlogCard
│   ├── layout/                  ← header, footer, mobile-nav, cart-drawer, …
│   ├── marketing/               ← hero, category-grid, featured, deals, …
│   ├── providers/               ← QueryClient, Theme, Toaster, Tooltip
│   ├── shared/                  ← next-adapters, add-to-cart, product-card, json-ld
│   └── shop/                    ← filters, pdp, cart, checkout, stub-page, …
│
├── data/                        ← mock catalog (brands, categories, products, reviews, posts)
├── lib/
│   ├── api/                     ← API client (Phase 7+)
│   ├── helpers/                 ← catalog-query, url, cart-math, json-ld
│   ├── stores/                  ← cart-store (Zustand)
│   └── config/                  ← site config (nav, social, contact)
│
└── styles/                      ← globals.css (tailwind + tokens)
```

## Routing model

Every customer-facing page lives under the `(shop)` route group so they share
a single layout: `PromoBar` → `SiteHeader` → `<main>{children}</main>` →
`SiteFooter` → `CartDrawer` (always-mounted, controlled by `useCartStore`).
The `(shop)` segment does not appear in URLs.

| Route                         | Type | Notes                                              |
| ----------------------------- | ---- | -------------------------------------------------- |
| `/`                           | SSG  | Homepage                                           |
| `/[category]`                 | SSG  | `generateStaticParams` → 6 categories              |
| `/products/[slug]`            | SSG  | 26 products prerendered                            |
| `/search`                     | SSR  | Dynamic — driven by `?q=&brand=&sort=&page=`       |
| `/cart`                       | SSG  | Client-only state via Zustand                      |
| `/checkout` / `/success`      | SSG  | Multi-step client flow                             |
| `/blog` / `/blog/[slug]`      | SSG  | 6 blog posts prerendered                           |
| `/brands` / `/brands/[slug]`  | SSG  | 10 brands prerendered                              |
| `/help/[topic]`               | SSG  | 5 topics prerendered                               |
| `/legal/[doc]`                | SSG  | 4 docs prerendered                                 |
| misc stubs                    | SSG  | account, wishlist, about, careers, etc.            |

`pnpm --filter @twinspire/frontend build` prerenders **81 pages** end-to-end.

## Data layer

Phase 6 ships with a local, type-safe mock catalog under
`apps/frontend/src/data/`. Each module exports an array plus typed lookup
helpers so call sites are already written the same way they will be against
the real API later:

```ts
import {
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  getRelatedProducts,
  getReviewsByProductId,
  getPostBySlug,
  getAllPosts,
} from '@/data';
```

When the backend endpoints in `apps/backend/src/modules/catalog/` are wired
into the frontend, only `apps/frontend/src/data/*.ts` will need to be
replaced — the call sites stay identical.

### Catalog query engine

`apps/frontend/src/lib/helpers/catalog-query.ts` ships a pure `queryCatalog`
function that the category, search, brand, deals, best-sellers, and
new-arrivals pages all share:

```ts
const result = queryCatalog(getAllProducts(), {
  q: 'oled monitor',
  category: 'tvs',
  brands: ['pulse', 'aurora-audio'],
  price: { min: 200, max: 1500 },
  rating: 4,
  inStock: true,
  sort: 'price-asc',
  page: 2,
  perPage: 24,
});
// → { items, total, page, perPage, totalPages, facets }
```

Facets returned by `queryCatalog` power the filters panel:

- `facets.brands` — `{ id, label, count }[]`
- `facets.ratings` — `[5, 4, 3, 2, 1]` with counts
- `facets.price` — `{ min, max }`

### URL helpers

`apps/frontend/src/lib/helpers/url.ts` exposes typed wrappers that round-trip
filter state through `URLSearchParams`:

```ts
const params = buildSearchParams({
  brand: ['aurora-audio', 'pulse'],
  rating: 4,
  inStock: true,
  page: 2,
});
// → "brand=aurora-audio&brand=pulse&rating=4&inStock=true&page=2"

readArrayParam(searchParams, 'brand');     // string[]
readNumberParam(searchParams, 'rating');   // number | undefined
readBooleanParam(searchParams, 'inStock'); // boolean | undefined
```

All filter UI (`shop/filters/filters-panel.tsx`, `shop/active-filters.tsx`,
`shop/sort-select.tsx`, `shop/pagination.tsx`) uses these helpers via
`useRouter()` + `useSearchParams()`, so every filter change updates the URL
(shareable, back-button safe).

### Cart math

`apps/frontend/src/lib/helpers/cart-math.ts` owns the canonical cart
calculation used by the cart drawer, cart page, and checkout review:

```ts
const totals = computeTotals(items, {
  couponCode: 'WELCOME10',
  shippingMethod: 'standard',
});
// → { subtotal, discount, shipping, tax, total, coupon }
```

Two mock coupons are pre-wired in `lookupCoupon`:

- `WELCOME10` — 10% off the order
- `FREESHIP` — free standard shipping

The same shape will be served by the backend pricing engine in Phase 4 once
it is wired in.

### Cart store

Zustand store at `apps/frontend/src/lib/stores/cart-store.ts`. Persists to
`localStorage` (`twinspire.cart.v1`) under `persist` middleware.

```ts
const items   = useCartStore((s) => s.items);
const coupon  = useCartStore((s) => s.couponCode);
const addItem = useCartStore((s) => s.addProduct);
const setQty  = useCartStore((s) => s.setQuantity);
const remove  = useCartStore((s) => s.remove);
const apply   = useCartStore((s) => s.applyCoupon);
const clear   = useCartStore((s) => s.clear);
```

The drawer, header badge, PDP add-to-cart button, cart page, and checkout
flow are all wired to the same store — every mutation propagates instantly.

## Component patterns

### Next-aware adapters

`@twinspire/ui` ships SSR-agnostic primitives that accept generic
`LinkComponent` and `ImageComponent` props. The Next.js app injects
`next/link` + `next/image` via small adapters in
`components/shared/next-adapters.tsx`:

```tsx
<ProductCard
  …
  linkComponent={NextLinkProductCard}
  imageComponent={NextImageProductCard}
/>
```

For most call sites we use the pre-wired `<NextProductCard>` wrapper from
`components/shared/product-card.tsx`, which also wires `onAddToCart` to the
cart store and pops a Sonner toast.

### `Button asChild` rule

Radix `Slot` requires a single child. When using `<Button asChild>` we put
the icon inside the child element:

```tsx
<Button asChild>
  <Link href="/deals">
    Shop the sale
    <ArrowRight aria-hidden />
  </Link>
</Button>
```

(`leftIcon` / `rightIcon` / `loading` are ignored when `asChild` is set.)

### Forms

Checkout uses `react-hook-form` + `zod` via `@hookform/resolvers/zod`. Each
`FormField` from `@twinspire/ui` requires an `id`. For Radix-based controls
(`Checkbox`, `Select`, `RadioGroup`) we wire `watch` + `setValue` instead of
spreading `register()` because they emit `onCheckedChange` / `onValueChange`
rather than a synthetic `onChange`.

### Markdown + TOC

`components/blog/markdown.tsx` ships a tiny markdown-to-React renderer
(headings with auto-generated IDs, paragraphs, lists, blockquotes, bold,
italic, code, links). `extractToc` returns
`[{ id, text, level }]`. `components/blog/blog-toc.tsx` consumes that and
highlights the active section via `IntersectionObserver`.

## SEO

- `app/sitemap.ts` — emits static URLs + dynamic
  product/category/brand/blog URLs.
- `app/robots.ts` — `Disallow: /cart /checkout /search`.
- `components/shared/json-ld.tsx` + `lib/helpers/json-ld.ts` — Product,
  BreadcrumbList, BlogPosting, and Organization JSON-LD blocks rendered on
  the relevant pages.
- Open Graph / Twitter metadata defined per-page via `generateMetadata` on
  PDP, blog posts, and category pages.

## Build & deploy

```bash
pnpm install
pnpm --filter @twinspire/frontend typecheck   # tsc --noEmit
pnpm --filter @twinspire/frontend lint        # next lint
pnpm --filter @twinspire/frontend build       # next build
pnpm --filter @twinspire/frontend start       # serves the build
```

`apps/frontend/next.config.mjs` opts into `output: 'standalone'` for the
Docker image. On Windows hosts without Developer Mode the symlink step of
the standalone trace fails — set `NEXT_DISABLE_STANDALONE=1` for local
Windows builds. CI on Linux runs without the flag.

## What changes in Phase 7

- Replace `apps/frontend/src/data/*` with calls into the backend catalog,
  reviews, wishlist, cart, orders, and blog endpoints.
- Replace the mock `lookupCoupon` + cart totals with the server-authoritative
  pricing engine (`apps/backend/src/services/pricing`).
- Build the authenticated account / orders / wishlist surfaces and replace
  the stubs in `(shop)/account/`, `(shop)/wishlist/`.
- Wire `useCartStore` to the persistent cart endpoint with optimistic
  updates and guest → user merge on login.
