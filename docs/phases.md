# TwinSpire — Build roadmap

Each phase produces compile-clean, runnable code before the next one begins.

| #  | Phase                          | Status        | Highlights                                                                 |
| -- | ------------------------------ | ------------- | -------------------------------------------------------------------------- |
| 1  | Foundation & tooling           | ✅ Complete   | Monorepo, tokens, API skeleton, infra, CI                                  |
| 2  | Database layer                 | ✅ Complete   | Mongoose schemas (30+), repositories, indexes, seed scripts                |
| 3  | Backend core                   | ✅ Complete   | Auth (JWT rotation, 2FA), RBAC, email, S3, Redis cache, OpenAPI + Swagger  |
| 4  | Backend domain APIs            | ✅ Complete   | Catalog, reviews, wishlist, cart, coupons, orders, payments, search        |
| 5  | Design system                  | ✅ Complete   | Tokens, Shadcn primitives, motion, commerce composables, Storybook         |
| 6  | Frontend public pages          | ✅ Complete   | Homepage, PDP, category, search, cart, checkout, blog, 81 prerendered pages |
| 7  | Auth & user dashboard          | ✅ Complete   | Login/register/2FA UI, profile, orders, addresses, wishlist, sessions       |
| 8  | Admin dashboard                | ⬜ Pending    | Analytics, catalog mgmt, orders, coupons, reviews, support                 |
| 9  | SEO · Perf · Testing           | ⬜ Pending    | JSON-LD, ISR, Playwright suite, 95+ Lighthouse                             |
| 10 | DevOps & deployment            | ⬜ Pending    | Vercel + AWS prod deploys, monitoring, backups                             |

## Phase 1 — what was delivered

### Created files

- **Root**: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.nvmrc`, `.npmrc`, `.prettierrc.json`, `.prettierignore`, `commitlint.config.cjs`, `lint-staged.config.cjs`, `.husky/*`, `.env.example`, `docker-compose.yml`, `eslint.config.mjs`, `README.md`
- **Shared packages**: `packages/{config,types,utils,ui}/`
- **Backend**: `apps/backend/` — Express app, env (Zod), Pino logger, request-id, error handler, security middleware, health endpoint, supertest smoke test
- **Frontend**: `apps/frontend/` — Next.js 15 App Router, layout, providers (Theme/Query/Toaster), API client, Zustand cart store, homepage with Hero/CategoryGrid/ValueProps, error/loading/not-found, robots.ts, sitemap.ts, manifest.ts, Playwright config
- **Infra**: `infrastructure/{docker,nginx}/`
- **CI**: `.github/workflows/{ci,codeql}.yml`, `dependabot.yml`, issue/PR templates, CODEOWNERS
- **Docs**: `docs/{architecture,setup,phases}.md`

### Acceptance criteria (run locally after `pnpm install`)

- [x] `pnpm typecheck` — all workspaces pass
- [x] `pnpm lint` — all workspaces pass
- [x] `pnpm test` — backend smoke + utils unit tests pass
- [x] `pnpm dev` — Next.js renders the homepage and Express serves `/api/v1/health`

## Phase 2 — what was delivered

### Created / modified files

- **DB infrastructure**: `apps/backend/src/db/{connection.ts, index.ts}` + `db/plugins/{soft-delete,json-transform,paginate,index}.ts`
- **Models (30)**: every collection in the spec lives under `apps/backend/src/models/*.model.ts`, exported from `models/index.ts`. Shared subschemas live in `models/common.schemas.ts`.
- **Repositories**: `apps/backend/src/repositories/{base,user,product,category,brand,order,cart,review,coupon,notification,session}.repository.ts` plus `index.ts`.
- **Seeding**: `apps/backend/src/scripts/{seed.ts, reset-db.ts}` + fixtures in `scripts/_lib/fixtures.ts`. Run with `pnpm --filter @twinspire/backend db:seed`.
- **Integration tests**: `apps/backend/src/test-utils/mongo-memory.ts` + `*.integration.test.ts` across models and repositories. Run with `pnpm --filter @twinspire/backend test:integration`.
- **Wiring**: `apps/backend/src/server.ts` connects to Mongo on boot and disconnects on shutdown. `routes/health.ts` exposes `/health/ready` that actually pings the DB.
- **Docs**: `docs/database.md` (full ER table, plugin guide, index reference, seed inventory).

### Acceptance criteria

- [x] `pnpm typecheck` — passes across workspaces
- [x] `pnpm lint` — passes across workspaces
- [x] `pnpm --filter @twinspire/backend db:seed` populates ~110 products, 50 users, 24 categories
- [x] `pnpm --filter @twinspire/backend db:reset` drops the database (refuses to run in production)
- [x] `pnpm --filter @twinspire/backend test:integration` brings up an in-memory Mongo and exercises model + repository behavior
- [x] `/api/v1/health/ready` returns `200` with `checks.database.status === 'ok'` when Mongo is up, `503` otherwise

## Phase 3 — what was delivered

### Created / modified files

- **Auth primitives**: `apps/backend/src/auth/{tokens,password,crypto,totp,cookies,types,index}.ts`
  — JWT access + refresh signing, bcrypt + strength scoring, base32 TOTP with QR + backup codes,
  HTTP-only signed refresh cookie helpers.
- **Middleware**: `apps/backend/src/middleware/{authenticate,rbac,validate,rate-limit,async-handler}.ts`
  — Bearer token guard, role hierarchy + permission guards, Zod validation with envelope errors,
  per-route rate limiters (global/auth/sensitive), async-handler wrapper.
- **Services**:
  - `services/cache/{redis,cache.service,index}.ts` — ioredis client + Cache-aside `wrap`, locks,
    `incr`, `del`, `acquireLock`/`releaseLock`.
  - `services/email/{transport,email.service,templates/*,index}.ts` — Nodemailer (smtp/console/jsonfile)
    transports + branded HTML templates for verify, reset, welcome, password-changed, 2FA enabled.
  - `services/storage/{s3,storage.service,index}.ts` — AWS S3 + presigned uploads with mime/ext
    whitelisting and public-URL builder that works for AWS, CloudFront, and MinIO.
  - `services/audit.service.ts` + `services/rbac.service.ts` — fire-and-forget audit writer + cached
    permission resolver.
- **Auth module** (`apps/backend/src/modules/auth/`): `auth.schemas.ts`, `auth.service.ts`,
  `auth.controller.ts`, `auth.routes.ts`, `social.service.ts`, `index.ts` — full register, login,
  refresh-with-rotation + reuse detection, logout, /me, verify-email, password reset, password
  change, TOTP setup/confirm/disable, sessions list/revoke, social login (Google/Facebook/Apple).
- **Users module** (`apps/backend/src/modules/users/`): profile, preferences, address book CRUD,
  default-address management, soft account deletion.
- **OpenAPI + Swagger**: `apps/backend/src/docs/{openapi,swagger}.ts` — full OpenAPI 3.1 generated
  from the Zod request schemas, mounted as Swagger UI at `${API_PREFIX}/docs` (toggle with
  `ENABLE_SWAGGER`), plus the raw spec at `${API_PREFIX}/docs/openapi.json`.
- **Wiring**: `app.ts`/`server.ts` connect Redis on boot, disconnect on shutdown; `/health/ready`
  now pings both Mongo and Redis. `models/user.model.ts` adds `twoFactorBackupCodes`, scrubs
  sensitive fields from `toJSON`/`toObject`.
- **Tests**:
  - Unit: `auth/password.test.ts`, `auth/tokens.test.ts`, `auth/totp.test.ts` (with the existing
    app smoke test).
  - Integration: `modules/auth/auth.integration.test.ts` — register → verify → login → refresh
    rotation → refresh-reuse detection → password reset → 2FA enrollment → RBAC.
- **Config**: extended `env.ts` for password/bcrypt/TOTP/cookie/social/Redis prefix/enable-swagger
  vars. `.env.example` already contained every key.
- **Docs**: `docs/auth.md` (token model, endpoints, RBAC, sessions, social, audit, cookies, rate
  limits) and `docs/api.md` (envelopes, status codes, validation, CORS, OpenAPI).

### Acceptance criteria

- [x] `pnpm typecheck` — backend compiles clean under `noUncheckedIndexedAccess` and strict
- [x] `pnpm --filter @twinspire/backend test` — 30 unit tests pass (tokens, password, TOTP, smoke)
- [x] `pnpm --filter @twinspire/backend test:integration` — 22 integration tests pass (auth,
      models, repositories) using mongodb-memory-server + ioredis-mock
- [x] `pnpm lint` — backend has zero linter errors
- [x] `${API_PREFIX}/docs` serves Swagger UI; `${API_PREFIX}/docs/openapi.json` returns the spec
- [x] `${API_PREFIX}/auth/{register,login,refresh,logout,me,verify-email,password/*,2fa/*,sessions/*,social}` all wired
- [x] Refresh-token rotation works end-to-end; replaying a rotated token returns
      `401 REFRESH_REUSE` and revokes every live session for the user

## Phase 4 — what was delivered

### Created / modified files

- **Catalog module** (`apps/backend/src/modules/catalog/`): `catalog.schemas.ts`,
  `catalog.service.ts`, `catalog.controller.ts`, `catalog.routes.ts`, `index.ts`.
  Public list with facets (brands, price range, conditions, ratings, tags),
  detail by slug, related products, featured/best-sellers/new-arrivals;
  admin CRUD for products, categories, brands with RBAC (`manager` to
  create/update, `admin` to delete); cache-aside on hot paths.
- **Reviews module** (`apps/backend/src/modules/reviews/`): user CRUD,
  verified-purchase auto-detection, helpful / not-helpful / report, moderator
  approval queue, automatic product-rating recomputation on every state
  change.
- **Wishlist module** (`apps/backend/src/modules/wishlist/`): persistent
  Mongo-backed wishlist plus a Redis-backed recently-viewed list (LRU, 30-day
  TTL, capped at 50 items per user).
- **Cart module** (`apps/backend/src/modules/cart/`): guest carts via signed
  HttpOnly cookie + user carts; add/update/remove; coupon attach/detach;
  guest → user merge fired automatically from `POST /auth/login` and
  `POST /auth/social/callback`.
- **Coupons module** (`apps/backend/src/modules/coupons/`): validate
  endpoint + admin CRUD with eligibility checks (`firstOrderOnly`,
  per-user usage, min subtotal, applicable/excluded scopes, stackable flag).
- **Pricing engine** (`apps/backend/src/services/pricing/`): deterministic
  server-authoritative quote — subtotal, percentage/fixed/free-shipping/BOGO
  coupons, capped discounts, configurable shipping/tax rules, 2-decimal
  rounding.
- **Orders module** (`apps/backend/src/modules/orders/`): `POST /orders/quote`
  for live pricing, `POST /orders` with idempotency-key caching + Redis
  distributed lock + stock checks + atomic cart clearing + coupon-usage
  bumping, user/admin listings, state-machine transitions, refund hook.
- **Payments module** (`apps/backend/src/modules/payments/`): Stripe payment
  intents (real or stub mode), PayPal Checkout orders, webhook handlers with
  signature verification (Stripe) and structural verification (PayPal),
  refund flow tied to `OrdersService.markRefunded`, mounted before
  `applySecurity` so the Stripe raw body survives.
- **Search module** (`apps/backend/src/modules/search/`): Elasticsearch
  client with health ping, indexer with mappings + bulk reindex + lifecycle
  hooks, faceted `/search` endpoint returning brand/category/price/rating
  aggregations, type-ahead `/search/suggest`, admin reindex; transparent
  Mongo-text-search fallback when ES is offline.
- **Model patches**: `_id: Types.ObjectId` exposed on `OrderDoc`,
  `CategoryDoc`, `BrandDoc`, `ReviewDoc`, `CartDoc`, `CouponDoc`,
  `PaymentDoc`, `WishlistDoc` so services can use it directly.
- **HttpError**: added `serviceUnavailable` factory + `SERVICE_UNAVAILABLE`
  code mapping.
- **Wiring**: `routes/index.ts` mounts `catalog`, `reviews`, `wishlist`,
  `cart`, `coupons`, `orders`, `payments`, `search`. `app.ts` mounts the
  Stripe/PayPal raw webhook routers ahead of body parsers.
- **Tests**:
  - Unit: `services/pricing/pricing.service.test.ts` (subtotal, shipping
    threshold, rounding).
  - Integration: `modules/catalog/catalog.integration.test.ts`,
    `modules/cart/cart.integration.test.ts`,
    `modules/orders/orders.integration.test.ts`.
- **Env**: added `STRIPE_API_VERSION`, `PAYPAL_WEBHOOK_ID`,
  `ELASTICSEARCH_URL`/`USERNAME`/`PASSWORD`/`API_KEY`/`PRODUCT_INDEX`/`TLS`,
  `TAX_RATE_DEFAULT`, `FREE_SHIPPING_THRESHOLD`, `SHIPPING_FLAT_RATE`,
  `ORDER_CART_TTL_DAYS`, `GUEST_CART_COOKIE`.
- **Docs**: `docs/catalog.md`, `docs/commerce.md`, `docs/payments.md`,
  `docs/search.md`.

### Acceptance criteria

- [x] `pnpm typecheck` — backend compiles clean under strict mode
- [x] `pnpm --filter @twinspire/backend test` — **34 unit tests pass** (4
      new pricing tests + existing 30)
- [x] `pnpm --filter @twinspire/backend test:integration` — **37
      integration tests pass** (catalog, cart, orders + existing 22)
- [x] Catalog list returns facets and paginated items; price/category filters
      narrow results correctly
- [x] Guest carts persist via signed cookie; merge on login is fire-and-forget
- [x] Pricing engine rounds totals to 2 decimals, caps discount to subtotal,
      applies free-shipping threshold correctly
- [x] `POST /orders` is idempotent on `idempotencyKey`, locks per cart, and
      empties the cart only after the order is persisted
- [x] Stripe webhook route uses `express.raw` and verifies signatures when
      `STRIPE_WEBHOOK_SECRET` is set (stub mode otherwise)
- [x] Refund flow updates payment and order documents and emits an audit log
- [x] `/search` returns faceted results from Elasticsearch when configured,
      and Mongo text search otherwise

## Phase 5 — what was delivered

### Created / modified files

- **Tokens** (`packages/ui/src/tokens.ts`, `tailwind.preset.cjs`,
  `src/styles/globals.css`): brand palette + neutral/status ramps, type scale
  (Inter / Geist / Geist Mono), spacing/radii/shadows/zIndex/motion tokens, dark
  theme via `.dark` class + HSL CSS variables, semantic gradients
  (`bg-gradient-hero`, `bg-gradient-card`, `bg-shimmer-bg`), keyframes
  (`fade-in/out`, `slide-up/down`, `scale-in`, `shimmer`, `pulse-soft`,
  `marquee`), aspect ratios (`product`, `banner`).
- **Hooks** (`packages/ui/src/lib/hooks/`):
  `useMediaQuery` + `useIsMobile/Tablet/Desktop` + `usePrefersReducedMotion`,
  `useControllableState`, `useDebouncedValue`, `useCopyToClipboard`,
  `useMounted`.
- **Primitives** (`packages/ui/src/components/`): `Accordion`, `Alert`,
  `AlertDialog`, `AspectRatio`, `Avatar`, `Badge` (9 variants), `Button` (8
  variants × 8 sizes via CVA), `Card` (+ Header/Title/Description/Content/Footer),
  `Checkbox`, `Dialog`, `DropdownMenu`, `EmptyState`, `FormField` (a11y wiring),
  `Input` (with addons), `Kbd`, `Label`, `Popover`, `Progress`, `RadioGroup`,
  `ScrollArea`, `Select`, `Separator`, `Sheet` (4 sides), `Skeleton` (shimmer),
  `Slider`, `Spinner`, `Switch`, `Tabs`, `Textarea`, `Toaster` (Sonner-based),
  `Tooltip`.
- **Motion** (`packages/ui/src/motion/`): `presets.ts` (durations, easings,
  springs, `fadeIn`/`slideUp`/`scaleIn`/`pop`/`heroIntro` variants), `<FadeIn>`,
  `<Reveal>` (scroll-triggered, IntersectionObserver-based), `<Stagger>` +
  `<StaggerItem>`, `<PageTransition>` (cross-fade between routes). Every motion
  component short-circuits when `prefers-reduced-motion: reduce`.
- **Commerce composables** (`packages/ui/src/commerce/`): `<Money>` (Intl
  formatter via `@twinspire/utils`), `<PriceTag>` (current + compare-at + auto
  discount %, four sizes), `<RatingStars>` (decimal-precise fill, accessible
  label), `<StockBadge>` (maps `StockStatus` to Badge variant), `<ProductCard>`
  (image, badges, price, rating, stock, CTA, wishlist toggle, image/link
  injection), `<ProductCardSkeleton>`, `<CategoryCard>` (default + tile
  variants), `<QuantityStepper>` (controlled/uncontrolled, clamped), `<Breadcrumb>`
  (custom link component).
- **Storybook** (`packages/ui/.storybook/`): `main.ts` (essentials, interactions,
  a11y, themes, links addons), `preview.ts` (theme switcher via class, axe-core
  a11y), Vite + PostCSS + Tailwind config so Storybook compiles the same theme
  the apps consume.
- **Stories**: Foundations/Tokens (palette, type, spacing, radii, shadows),
  Primitives/Button, Primitives/Badge, Primitives/Input, Primitives/Dialog,
  Motion/Presets, Commerce/ProductCard, Commerce/PriceTag,
  Commerce/RatingStars, Commerce/QuantityStepper.
- **Tests** (`packages/ui/src/**/*.test.tsx` — Jest 29 + jsdom + Testing
  Library + user-event): `cn`, `Button`, `Badge`, `FormField`, `Money`,
  `PriceTag`, `RatingStars`, `QuantityStepper`, `ProductCard`.
- **Frontend wiring**:
  - `apps/frontend/src/components/providers/index.tsx` now uses
    `<Toaster>` + `<TooltipProvider>` from `@twinspire/ui`.
  - `apps/frontend/src/components/marketing/hero.tsx` and `category-grid.tsx`
    rebuilt on `<Button>`, `<Badge>`, `<Reveal>`, `<Stagger>`.
  - New `apps/frontend/src/components/marketing/featured-products.tsx` showcases
    `<ProductCard>` with `next/link` + `next/image` injection.
  - Bug fixes: `api-client.ts` (proper `ApiResponse` narrowing) and
    `theme-provider.tsx` (`next-themes` no longer exports `ThemeProviderProps`).
- **Tooling**: removed dead `project: './tsconfig.json'` parserOptions from
  `packages/{ui,utils,types}` eslint configs (was conflicting with
  `projectService: true` in the base config), tightened type-vs-interface and
  no-useless-escape lints they were masking.
- **Docs**: `docs/design-system.md` — full design-system reference (token
  surface, primitives, motion, composables, Storybook, testing, conventions,
  frontend integration).

### Acceptance criteria

- [x] `pnpm typecheck` — all six workspaces pass clean
- [x] `pnpm --filter @twinspire/ui test` — **31 component tests pass** (cn,
      Button, Badge, FormField, Money, PriceTag, RatingStars, QuantityStepper,
      ProductCard)
- [x] `pnpm --filter @twinspire/ui storybook` boots Storybook on
      `http://localhost:6006` with theme switcher and a11y addon
- [x] `pnpm --filter @twinspire/ui storybook:build` produces a static bundle in
      `packages/ui/storybook-static/`
- [x] Frontend home page renders Hero / CategoryGrid / FeaturedProducts using
      the new primitives, composables, and motion presets
- [x] `<ProductCard>` accepts `linkComponent={NextLink}` +
      `imageComponent={NextImage}` and integrates with `next/image`
- [x] Dark mode flips correctly via `.dark` class; all primitives swap palette
- [x] `prefers-reduced-motion` short-circuits every motion primitive

## Phase 6 — what was delivered

### Created / modified files

- **Mock catalog data layer** (`apps/frontend/src/data/`): `brands.ts`,
  `categories.ts`, `products.ts`, `reviews.ts`, `posts.ts`, `index.ts`.
  Self-contained fixtures with rich product specs, variants, images,
  reviews, blog posts with markdown bodies, authors, tags. Helpers expose
  filtered slices (`getFeaturedProducts`, `getBestSellers`, `getNewArrivals`,
  `getDeals`, `getRelatedProducts`, `getReviewsByProductId`,
  `getPostBySlug`, `getRelatedPosts`, etc.). These will be replaced by API
  fetches in a later phase without changing call sites.
- **Catalog helpers** (`apps/frontend/src/lib/helpers/`):
  - `catalog-query.ts` — full query engine (`queryCatalog`) that filters by
    brand, price range, rating, in-stock, search text, sorts by relevance /
    price / rating / newest / popularity, paginates, and computes facets
    (brand counts, rating buckets, price min/max).
  - `url.ts` — `buildSearchParams`, `toUrlSearchParams`, and typed
    `readArray/Number/Boolean/String` query helpers.
  - `cart-math.ts` — `compactItems`, mock `lookupCoupon`, and a
    deterministic `computeTotals` (subtotal / discount / shipping / tax /
    total) shared between cart drawer, cart page, and checkout review.
  - `json-ld.ts` — `productJsonLd`, `breadcrumbJsonLd`, `blogPostingJsonLd`,
    `organizationJsonLd` generators for Schema.org structured data.
- **Cart store** (`apps/frontend/src/lib/stores/cart-store.ts`): Zustand
  store with persist middleware (localStorage). Actions: `addProduct`,
  `setQuantity`, `remove`, `applyCoupon`, `clear`. Coupon code survives
  reloads.
- **Shared Next.js adapters**
  (`apps/frontend/src/components/shared/next-adapters.tsx`): typed
  adapters that inject `next/link` + `next/image` into
  `@twinspire/ui/ProductCard`, `CategoryCard`, and `Breadcrumb` (which
  accept generic `LinkComponent` / `ImageComponent` props for SSR
  agnosticism).
- **Shared components**:
  - `shared/add-to-cart-button.tsx`, `shared/product-card.tsx` (Next-aware
    wrapper around the UI `ProductCard`), `shared/json-ld.tsx`.
- **Layout chrome**
  - `layout/promo-bar.tsx` — dismissible top promo banner.
  - `layout/header.tsx` — refined with primary nav links, integrated
    `<SearchBar>` (routes to `/search?q=`), `<MobileNav>`, `<CartIcon>`,
    theme toggle, account link.
  - `layout/mobile-nav.tsx` — `Sheet`-based mobile drawer with full nav,
    services, sign-in CTAs.
  - `layout/search-bar.tsx` — debounced input that pushes
    `/search?q=...`.
  - `layout/cart-icon.tsx` + `layout/cart-drawer.tsx` — header icon shows
    live count from the Zustand store; clicking opens a `Sheet`-based
    drawer with line items, qty steppers, remove buttons, totals, and
    Checkout / View cart CTAs.
  - `layout/footer.tsx` + `layout/newsletter-form.tsx` — multi-column
    footer with newsletter capture (mock submission + `sonner` toasts),
    social links, legal links, copyright.
- **Shop route group** (`apps/frontend/src/app/(shop)/`): new route group
  that owns the entire customer-facing surface and shares one layout.
  `apps/frontend/src/app/page.tsx` was removed and the homepage moved to
  `(shop)/page.tsx`.
- **Homepage** (`(shop)/page.tsx`): Hero, BrandStrip, CategoryGrid,
  FeaturedProducts (new arrivals), DealsBanner, BestSellers, ValueProps,
  EditorialStrip — every section built on `@twinspire/ui` primitives +
  Reveal/Stagger motion presets.
- **Category listing** (`(shop)/[category]/page.tsx` + `loading.tsx`):
  `generateStaticParams` produces `/phones`, `/laptops`, `/tvs`,
  `/audio`, `/gaming`, `/accessories`. Filters panel
  (`shop/filters/filters-panel.tsx`) + active-filter chips
  (`shop/active-filters.tsx`) + sort dropdown
  (`shop/sort-select.tsx`) + product grid (`shop/product-grid.tsx`) +
  pagination (`shop/pagination.tsx`). Loading skeleton mirrors the layout.
- **Product detail** (`(shop)/products/[slug]/page.tsx` + `loading.tsx`):
  `generateStaticParams` prerenders all 26 SKUs. `shop/pdp/product-gallery.tsx`
  (thumbnails + main viewer), `shop/pdp/product-buy-box.tsx` (price, stock,
  qty stepper, add-to-cart wired to the store), `Tabs` (Overview / Specs /
  Reviews / Shipping), `shop/pdp/product-specs.tsx` (accordion of grouped
  specs), `shop/pdp/product-reviews.tsx` (rating summary + per-review
  cards), `shop/pdp/related-products.tsx`. `JsonLd` emits Product +
  BreadcrumbList structured data.
- **Search** (`(shop)/search/page.tsx`): same filters / sort / grid /
  pagination as the category page but driven entirely by query params
  (`q`, `brand[]`, `rating`, `price`, `sort`, `page`). Dynamic.
- **Cart page** (`(shop)/cart/page.tsx` + `shop/cart/*`): line items with
  qty steppers and remove buttons, coupon form (toast on apply/error),
  totals card with subtotal / discount / shipping / tax / grand total,
  Checkout CTA. Empty-state with link to Deals.
- **Checkout flow** (`(shop)/checkout/page.tsx` + `shop/checkout/*`):
  three-step flow with progress stepper — Shipping
  (`shipping-form.tsx`, zod-validated with `react-hook-form`), Payment
  (`payment-form.tsx` — card or PayPal, save-card checkbox wired through
  `setValue`), Review (`order-review.tsx`). Final submit clears the cart,
  routes to `(shop)/checkout/success/page.tsx` with a fabricated order
  number. Sticky order summary on the side.
- **Blog**:
  - `blog/markdown.tsx` — custom lightweight markdown-to-React renderer
    (headings with auto-IDs, paragraphs, ordered/unordered lists,
    blockquotes, **bold**, *italic*, `code`, links). No extra deps.
  - `blog/blog-toc.tsx` — `IntersectionObserver`-based sticky TOC that
    highlights the active section.
  - `blog/blog-card.tsx` — card with cover image, tags, author, date,
    read-time.
  - `(shop)/blog/page.tsx` — featured post + grid of remaining posts.
  - `(shop)/blog/[slug]/page.tsx` — full post with TOC, share links,
    related posts. `JsonLd` emits BlogPosting structured data.
- **Marketing sections** (homepage support):
  `marketing/best-sellers.tsx`, `marketing/deals-banner.tsx`,
  `marketing/brand-strip.tsx`, `marketing/editorial.tsx`, plus the
  existing `hero.tsx`, `category-grid.tsx`, `featured-products.tsx`,
  `value-props.tsx`.
- **Misc pages** (`(shop)/`): `deals/`, `best-sellers/`, `new-arrivals/`,
  `brands/` (index + dynamic `[slug]`), `categories/`, `account/`,
  `wishlist/`, `help/[topic]/` (faq, shipping, returns, warranty,
  contact), `legal/[doc]/` (privacy, terms, cookies, accessibility),
  `about/`, `careers/`, `press/`, `sustainability/`, `stores/`. Each
  stub renders via the shared `shop/stub-page.tsx` component with
  breadcrumbs + Phase-7 placeholder messaging.
- **SEO**:
  - `app/sitemap.ts` updated to include every static route plus dynamic
    products / brands / categories / blog posts.
  - `app/robots.ts` updated to disallow `/cart`, `/checkout`, `/search`.
- **Design system patches** (consumed during Phase 6):
  - `packages/ui/src/commerce/index.ts` — re-export
    `BreadcrumbLinkComponent`.
  - `packages/ui/src/components/button.tsx` — when `asChild` is set,
    forward the consumer's child untouched to Radix `Slot` to keep the
    single-child contract (icons / loading states are now responsibility
    of the child element).
- **Config**: `apps/frontend/next.config.mjs` — gate `output: 'standalone'`
  on `NEXT_DISABLE_STANDALONE` so local Windows builds succeed without
  developer mode; CI on Linux keeps standalone output enabled.

### Acceptance criteria

- [x] `pnpm --filter @twinspire/frontend typecheck` — clean
- [x] `pnpm --filter @twinspire/frontend lint` — clean
- [x] `pnpm --filter @twinspire/ui typecheck` — clean
- [x] `pnpm --filter @twinspire/frontend build` — **81 / 81 pages
      prerender successfully** (homepage, 6 categories, 26 products, 10
      brands, 6 blog posts, 5 help topics, 4 legal docs, and all
      marketing / stub pages)
- [x] Add-to-cart on PDP / homepage / cart drawer / cart page all share
      the same Zustand store; cart persists across reloads
- [x] Checkout flow validates shipping + payment with zod, clears cart,
      navigates to the success page with an order number
- [x] Category, search, and brand pages all filter / sort / paginate
      via URL query params (shareable links, back-button safe)
- [x] Blog post page renders markdown + TOC + related posts; structured
      data emitted via `JsonLd`
- [x] `sitemap.xml` lists every static + dynamic route; `robots.txt`
      blocks transactional surfaces (`/cart`, `/checkout`, `/search`)

### What's next (Phase 7 — preview)

Auth + user dashboard: login/register/2FA UI, address book, order history,
saved payment methods, wishlist UI wired to the persistent backend, and
the account stubs replaced with real pages.

## Phase 7 — what was delivered

### Created / modified files

- **Typed API client + mock backend**
  (`apps/frontend/src/lib/api/`):
  - `types.ts` — request/response contracts that mirror every backend
    schema in `modules/{auth,users,orders,wishlist}` (`LoginInput`,
    `RegisterInput`, `AuthSessionResponse`, `OrderListItem`,
    `WishlistResponse`, `AuthSession`, `TwoFactorSetupResult`, etc.).
  - `mock-data.ts` — seed user (`demo@twinspire.dev` /
    `TwinSpire!2026`), two addresses, three orders covering paid /
    shipped / delivered states, and a 5-product wishlist sourced from
    the Phase 6 catalog.
  - `mock-backend.ts` — full client-side implementation of every auth
    + user route, persisted to localStorage. Handles credential
    validation, 2FA challenge, session list/revoke, address CRUD with
    default address selector, order list/get/cancel with timeline
    transitions, and wishlist add/remove/clear plus recently-viewed.
  - `access-token.ts` + `client.ts` — in-memory access token (XSS-safe)
    with one-shot `/auth/refresh` retry on 401 against the real
    Express API.
  - `index.ts` — single `api` facade that picks between the mock and
    real backend based on `NEXT_PUBLIC_USE_MOCK_API` (defaults to
    `true`, set to `false` once the backend has its env secrets and
    Mongo running).
- **Auth state + hooks** (`apps/frontend/src/lib/stores/auth-store.ts`,
  `lib/hooks/`):
  - Zustand `useAuthStore` (`status`, `user`, `hasHydrated`,
    `bootstrap`, `setUser`, `signOut`) with `useSession` /
    `useSessionBootstrap` helpers and a `SessionProvider` mounted in
    `AppProviders`.
  - TanStack Query hooks: `useProfileQuery`,
    `useUpdateProfile`/`useUpdatePreferences`, `useAddressesQuery` +
    full CRUD mutations, `useOrdersQuery`/`useOrderQuery`/`useCancelOrder`,
    `useWishlistQuery`/`useAddToWishlist`/`useRemoveFromWishlist`/
    `useClearWishlist`/`useRecentlyViewedQuery`,
    `useSessionsQuery`/`useRevokeSession`.
- **Auth UI** (`apps/frontend/src/components/auth/`):
  `auth-card.tsx` (centered card shell), `auth-schemas.ts` (zod for
  login / register / forgot / reset / change password),
  `password-strength.tsx` (live meter with rule hints),
  `social-buttons.tsx` (Google / Facebook / Apple via the social
  endpoint), `or-divider.tsx`, `login-form.tsx` (auto-prompts for 2FA
  when the server returns `TOTP_REQUIRED`), `register-form.tsx`
  (auto-signs in after register), `forgot-password-form.tsx`,
  `reset-password-form.tsx`, `verify-email-status.tsx`.
- **Auth pages** (`apps/frontend/src/app/(auth)/`): standalone
  two-column layout (`layout.tsx`) plus `login/`, `register/`,
  `forgot-password/`, `reset-password/`, `verify-email/` pages. All
  marked `robots: { index: false }`.
- **Account dashboard** (`apps/frontend/src/components/account/` +
  `app/(shop)/account/`):
  - `auth-guard.tsx` — client guard with `returnTo` redirect.
  - `account-sidebar.tsx` — sticky nav with avatar, loyalty points,
    sign-out, and tab highlighting; integrated into the new
    `(shop)/account/layout.tsx`.
  - `dashboard-stats.tsx`, `dashboard-greeting.tsx`,
    `recent-orders-card.tsx`, `account-quick-links.tsx` — overview
    page composition.
  - `profile-form.tsx`, `preferences-form.tsx` for `/account/profile`
    and `/account/preferences`.
  - `change-password-form.tsx`, `two-factor-card.tsx` (setup dialog
    with QR/secret + backup-code reveal + disable confirmation),
    `sessions-card.tsx` (active devices with revoke) for
    `/account/security`.
  - `addresses-page-content.tsx`, `address-form.tsx`, `address-card.tsx`
    for `/account/addresses` — full CRUD + default address selector +
    AlertDialog confirmations.
  - `orders-list.tsx`, `order-status-badge.tsx`, `order-detail.tsx`,
    `order-timeline.tsx` for `/account/orders` and
    `/account/orders/[id]` — status filters, pagination, invoice +
    tracking placeholders, cancel dialog.
  - `wishlist-page-content.tsx`, `public-wishlist-gate.tsx` for
    `/account/wishlist` and the public `/wishlist` sign-in gate.
  - `/account/payment-methods/page.tsx` reserves the route for
    Phase 8's Stripe wallets.
- **Shop integration**:
  - `components/layout/account-menu.tsx` — header avatar dropdown
    (Dashboard / Orders / Wishlist / Addresses / Security / Sign out)
    with a graceful "Sign in" fallback while unauthenticated.
  - `header.tsx` swaps the static user icon for `<AccountMenu>`.
  - `shared/wishlist-button.tsx` + `shared/product-card.tsx` — every
    product card / PDP heart now toggles the persistent backend
    wishlist (prompts sign-in for guests, optimistic updates via
    TanStack Query).
  - `shop/checkout/checkout-flow.tsx` — pre-fills the shipping form
    from the signed-in user's default address and surfaces a "we
    pre-filled your saved details" hint with a link to the address
    book.
- **Env + SEO**:
  - `src/env.ts` adds `NEXT_PUBLIC_USE_MOCK_API` (boolean, default
    `true`).
  - `app/sitemap.ts` adds `/login` + `/register`; `app/robots.ts`
    blocks `/forgot-password`, `/reset-password`, `/verify-email`.
- **Tooling**: `apps/frontend/.eslintrc.json` honours `^_`-prefixed
  unused vars (used by the mock backend's deliberately-ignored email /
  token parameters).
- **Providers**: `components/providers/session-provider.tsx` mounts
  the auth bootstrap once below `QueryProvider`, above
  `TooltipProvider`.

### Acceptance criteria

- [x] `pnpm --filter @twinspire/frontend typecheck` — clean
- [x] `pnpm --filter @twinspire/frontend lint` — clean (zero warnings,
      `--max-warnings=0`)
- [x] `pnpm --filter @twinspire/frontend build` — **93 / 93 pages
      prerender** (12 new auth + account routes on top of Phase 6's 81)
- [x] Demo login at `demo@twinspire.dev` / `TwinSpire!2026` reaches the
      dashboard with three seeded orders, two addresses, and a
      5-product wishlist
- [x] Register flow creates a new local user, auto-signs in, and lands
      on the dashboard
- [x] Login form auto-detects 2FA challenge and asks for a 6-digit
      code; security page enables / disables 2FA with backup codes
- [x] Forgot / reset password and verify-email tokenised flows render
      success / error states cleanly
- [x] `/account/*` is guarded — guests are redirected to
      `/login?returnTo=…` and bounced back after sign-in
- [x] Address book supports CRUD + default selector; checkout
      pre-fills shipping from the default address
- [x] Order list filters by status and paginates; detail page renders
      timeline, totals, tracking number, and cancel dialog
- [x] Product card / PDP heart icon persists to the wishlist; the
      `/wishlist` route prompts sign-in for guests and forwards
      authenticated users to `/account/wishlist`
- [x] Header avatar dropdown reflects session state on every page
      (sign-in CTA when logged out, full menu when logged in)
- [x] `NEXT_PUBLIC_USE_MOCK_API=false` switches every hook to the
      real `/api/v1/*` Express endpoints — same call sites, no
      component changes needed

## Phase 8 — what was delivered

A complete staff console at `/admin/*` for managing every aspect of the
storefront. Like Phase 7 it ships behind the same `NEXT_PUBLIC_USE_MOCK_API`
toggle: out of the box every panel reads + writes through a client-only
admin backend that mirrors the Express `/admin/*` routes, so designers and
PMs can demo the full surface without standing up the real API.

### Admin mock backend + API facade

- **`lib/api/admin-mock-data.ts`** — fixtures for ten extra orders across
  eight different customers, six coupons (active / paused / expired /
  scope-restricted), six moderation reviews (`pending`, `flagged`,
  `approved`, `rejected`), an 8-event audit log, and an analytics builder
  that derives KPIs (revenue today, AOV, conversion proxies, top
  products, category share, low stock, pending queues) from the live
  product + order data.
- **`lib/api/admin-mock-backend.ts`** — full CRUD for catalog, taxonomy,
  orders, coupons, review moderation, customers, and the audit log.
  Role-gated: managers can read everything and write to most surfaces,
  destructive actions (product delete, coupon delete, customer role
  changes, refunds) require `admin`. localStorage-backed so changes
  survive reloads; `adminMockBackend._reset()` re-seeds.
- **`lib/api/admin-types.ts`** — shared request / response contracts
  (paginated lists, upsert inputs) consumed by both the mock backend
  and the real-API code path.
- **`lib/api/index.ts`** — extends the Phase 7 facade with
  `api.admin.{ analytics, products, categories, brands, orders, coupons,
  reviews, customers, audit }`. Every method picks between the mock and
  the real `authedApi` based on `NEXT_PUBLIC_USE_MOCK_API`. Real-API
  routes map to the existing `/catalog/admin/*`, `/orders/admin/all`,
  `/coupons/admin`, and `/reviews/admin/*` endpoints, with
  `/admin/{customers,audit,analytics,categories,brands,products}`
  reserved for the Phase 9 backend.
- **Auth seeding**: `mock-backend.ensureSeeded()` now also creates the
  `admin@twinspire.dev` and `manager@twinspire.dev` demo staff accounts
  (password **`TwinSpire!2026`**, both with 2FA enabled — any 6-digit
  code passes the mock TOTP check).

### TanStack Query hooks

`lib/hooks/use-admin.ts` exposes paginated list hooks and mutations for
every admin surface (`useAdminAnalytics`, `useAdminProducts` +
`useAdminProduct`, `useCreate/Update/DeleteAdminProduct`,
`useAdminCategories` + CRUD, `useAdminBrands` + CRUD, `useAdminOrders`
+ `useAdminOrder` + `useUpdateAdminOrder` + `useRefundAdminOrder`,
`useAdminCoupons` + `useAdminCoupon` + CRUD, `useAdminReviews` +
`useModerateAdminReview` + `useDeleteAdminReview`, `useAdminCustomers`
+ `useAdminCustomer` + `useUpdateAdminCustomer`, `useAdminAudit`). All
mutations surface toast notifications and invalidate the corresponding
list query.

### `/admin` route group + chrome

`app/(admin)/admin/layout.tsx` ships its own shell (no shop header /
footer) wrapped in `AdminGuard`:

- **`AdminGuard`** redirects unauthenticated users to `/login?returnTo=…`
  and renders an accessible 403 panel for signed-in customers who lack
  staff privileges.
- **`AdminSidebar`** — sticky desktop nav with five sections (Overview,
  Catalog, Commerce, People, System), per-route active state, user card
  with role badge, "My account" + sign-out shortcuts.
- **`AdminTopbar`** — mobile menu (slides the sidebar in via `<Sheet>`),
  a search input placeholder (⌘K hook-up arrives with Phase 9), a status
  pill ("All systems operational"), notifications bell, and avatar link
  back to the storefront account.
- **`AdminPageHeader`** — unified title / description / breadcrumb /
  actions slot reused on every sub-page.
- **`components/layout/account-menu.tsx`** adds an "Admin console" entry
  in the storefront avatar dropdown when the signed-in user is staff.

### Dashboard (`/admin`)

`components/admin/dashboard-overview.tsx` composes:

- Four KPI tiles (revenue today, orders today, AOV, active customers)
  each with a delta vs. last period and an inline `<Sparkline>` of the
  last 14 days.
- A 30-day Revenue / Orders tabbed area chart (custom SVG component in
  `charts.tsx` — gradient fill, axis ticks, grid, no extra deps).
- "Recent orders" card linking into the admin detail view.
- `Orders by status` donut with a coloured legend.
- "Needs attention" alerts (pending fulfilment, pending reviews, low
  stock) deep-linking into the relevant filtered list.
- Top products (image + revenue + units sold) and top categories with
  share bars.
- "Recent admin activity" snapshot driven by the audit log.

### Catalog management

- **`/admin/products`** — searchable, status / brand / category /
  low-stock filterable, paginated list with summary tiles per status,
  publication + stock pills, and one-click row edit.
- **`/admin/products/new`** + **`/admin/products/[id]`** — full form
  (basic info, description, pricing + compare-at, primary image with
  live preview, organisation, status & inventory, storefront badges).
  Backed by `react-hook-form` + `zod`. Delete is gated to `admin`.
- **`/admin/categories`** + **`/admin/brands`** — side-sheet upsert
  form with name / slug / description / image / featured / active
  toggles. Categories show parent + product count; brands show country
  of origin + product count. Delete is gated to `admin`.

### Orders

- **`/admin/orders`** — search by order number / customer / email,
  status filter (incl. deep-link `?status=…` from the dashboard),
  paginated list, item previews, status pill, total. Suspense-wrapped
  to satisfy the Next.js 15 `useSearchParams` rule.
- **`/admin/orders/[id]`** — full detail: customer card, items,
  shipping address + tracking, totals breakdown with coupon badges, an
  internal notes panel, status + fulfilment + carrier + tracking +
  internal-note update form (changes append to the timeline), and a
  refund dialog (gated to `admin`) that previews the amount before
  confirming and logs the action to the audit trail.

### Coupons

- **`/admin/coupons`** — code, type (percentage / fixed / free
  shipping / BOGO), redemption progress bar, expiry, scope flags
  (`First order`, `Stackable`). Search + active/inactive filter.
- Upsert via a `<Sheet>` form: percentage / fixed / free-shipping /
  BOGO types, min-subtotal, usage limits, date range, active /
  stackable / first-order toggles. Mutations validate uniqueness
  (`409 CODE_TAKEN`).

### Review moderation

- **`/admin/reviews`** — tabbed queue (`Pending`, `Flagged`,
  `Approved`, `Rejected`, `All`) with product thumb, star rating,
  verified-purchase badge, helpful / not-helpful counts, moderator
  notes, and per-row Approve / Reject / Flag / Delete actions. Reject
  and Flag open a dialog so moderators can record an internal note.

### Customers + audit

- **`/admin/customers`** — search + status filter; columns: avatar,
  status, order count, lifetime spend, loyalty points, last seen.
- **`/admin/customers/[id]`** — profile card with 2FA badge, lifetime
  spend, contact info, recent orders, preferences, plus a status / role
  selector (admin only; you can't change your own role).
- **`/admin/audit`** — paginated, searchable audit log with actor,
  action, entity, entity ID, and structured metadata.

### Settings

- **`/admin/settings`** — environment badge (Mock backend vs. Live
  API), demo "marketing emails" and "maintenance mode" toggles, plus a
  one-click "Reset mock data" action that re-seeds the localStorage
  store from `admin-mock-data.ts`.

### Shared building blocks

`components/admin/` ships reusable primitives so future admin pages
stay consistent:

- `DataTable` — accessible sticky-header table with loading skeletons,
  empty state, optional row click, and column alignment helpers.
- `Paginator` — "Showing X–Y of Z" + previous / next.
- `StatCard` — KPI tile with delta pill + optional sparkline slot.
- `Sparkline`, `AreaChart`, `Donut` — zero-dependency SVG charts.
- `OrderStatusPill` — colour-coded status badge reused across the
  dashboard, orders list, customer detail, and order detail.
- `TaxonomyFormSheet`, `CouponFormSheet`, `ProductForm` — typed,
  validation-driven forms.

### Tests + docs

- `apps/frontend/src/lib/api/admin-mock-backend.test.ts` — 11 Jest
  tests covering role gating, product CRUD + delete gating, order
  updates, refund gating, coupon uniqueness, review approval, and
  customer suspend / role change semantics. Combined with the Phase 7
  suite this brings the frontend Jest total to **32 tests / 3
  suites**.
- `docs/admin-frontend.md` — architecture guide (route group, guard,
  mock layer, role matrix, deep-link map, switching to the real API).

### Acceptance criteria

- [x] `pnpm --filter @twinspire/frontend typecheck` — clean
- [x] `pnpm --filter @twinspire/frontend lint` — clean (zero warnings,
      `--max-warnings=0`)
- [x] `pnpm --filter @twinspire/frontend build` — **104 / 104 pages
      prerender** (Phase 7's 93 + 11 new admin routes)
- [x] `pnpm --filter @twinspire/frontend test` — **32 tests passing
      across 3 suites**
- [x] Sign in as `admin@twinspire.dev` / `TwinSpire!2026` (any 6-digit
      TOTP) and `/admin` renders KPI tiles, charts, recent orders, and
      attention alerts with live mock data
- [x] Catalog: list, create, edit, soft-update and (admin-only) delete
      products / categories / brands — with audit log entries
- [x] Orders: filter by status from URL (`?status=processing`), update
      fulfilment / tracking / status, append timeline entries, and
      (admin-only) issue refunds via dialog
- [x] Coupons: create, pause, edit, and (admin-only) delete coupons —
      uniqueness validation surfaces a localised error
- [x] Reviews: approve / reject / flag with internal note; queue tabs
      reflect counts; admin can hard-delete
- [x] Customers: list with lifetime spend, detail view with recent
      orders, admin-only status / role controls (your own role is
      locked)
- [x] Audit log: paginated, searchable, captures every mutation
      performed through the admin UI
- [x] Role gating: signing in as `demo@twinspire.dev` and visiting
      `/admin` renders the 403 panel (not a redirect loop)
- [x] `NEXT_PUBLIC_USE_MOCK_API=false` swaps every admin hook to the
      real Express endpoints — same call sites, no component changes
      needed

### What's next (Phase 9 — preview)

Backend admin routes & analytics aggregation: implement the
`/admin/{analytics,customers,audit}` REST endpoints in Express so the
frontend can run against real data, plus search reindex hooks,
realtime presence (WebSocket), and the support ticket inbox.
