# TwinSpire — Database design

> Status: Phase 2 complete. All collections, indexes, and the repository layer are implemented.

## Stack

- **Engine**: MongoDB 7.x (Atlas in prod, Docker in dev, mongodb-memory-server in tests)
- **ODM**: Mongoose 8
- **Plugins**: soft-delete · JSON transform · paginate (applied via `applyBasePlugins`)

## Collections

| Collection         | Model file                          | Highlights                                                                                  |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `users`            | `user.model.ts`                     | bcrypt password hash, lockout, 2FA secret, external IDs, preferences, virtual addresses     |
| `roles`            | `role.model.ts`                     | Slug-keyed, references many `permissions`                                                   |
| `permissions`      | `permission.model.ts`               | `resource:action` unique pair                                                               |
| `addresses`        | `address.model.ts`                  | Pre-save hook enforces single default per user                                              |
| `sessions`         | `session.model.ts`                  | Refresh tokens — TTL index on `expiresAt`, hashed tokens, replacement chain                 |
| `brands`           | `brand.model.ts`                    | Text index, featured/active filters                                                         |
| `categories`       | `category.model.ts`                 | Nested via `parentId`/`ancestors`/`level`/`path`                                            |
| `products`         | `product.model.ts`                  | Variants subdoc, attributes, specs, rating summary, full-text + 8 compound indexes          |
| `inventory`        | `inventory.model.ts`                | Per warehouse, movements log, auto-computed `available`                                     |
| `carts`            | `cart.model.ts`                     | Guest + user, TTL index on `expiresAt`                                                      |
| `wishlists`        | `wishlist.model.ts`                 | Named lists, public toggle, price alerts                                                    |
| `orders`           | `order.model.ts`                    | Embedded items + totals + timeline; auto order number                                       |
| `payments`         | `payment.model.ts`                  | Provider-agnostic; raw event JSON kept select:false                                         |
| `coupons`          | `coupon.model.ts`                   | Currency + window + usage limits + scope filters                                            |
| `campaigns`        | `campaign.model.ts`                 | Bundles products / categories / brands / coupons                                            |
| `banners`          | `banner.model.ts`                   | Placement-scheduled, impressions/clicks                                                     |
| `reviews`          | `review.model.ts`                   | Unique per (productId, userId), moderation states                                           |
| `notifications`    | `notification.model.ts`             | Per-channel, per-category, read state                                                       |
| `tickets`          | `ticket.model.ts`                   | Auto ticket number, assignment, priority                                                    |
| `ticketMessages`   | `ticket-message.model.ts`           | Customer / agent / system, with attachments                                                 |
| `blogAuthors`      | `blog-author.model.ts`              | Slug-keyed, social links                                                                    |
| `blogTags`         | `blog-tag.model.ts`                 | Post counter                                                                                |
| `blogPosts`        | `blog-post.model.ts`                | Text index, scheduling, SEO metadata                                                        |
| `faqs`             | `faq.model.ts`                      | Categorised, ordered, full-text                                                             |
| `stores`           | `store.model.ts`                    | GeoJSON `location` + `2dsphere` index                                                       |
| `settings`         | `setting.model.ts`                  | Key-value with public/secret flags                                                          |
| `auditLogs`        | `audit-log.model.ts`                | Actor + target + before/after diff                                                          |
| `activityLogs`     | `activity-log.model.ts`             | Per-user behavioral signals                                                                 |
| `searchHistory`    | `search-history.model.ts`           | Normalised query + clicked products                                                         |
| `analyticsEvents`  | `analytics-event.model.ts`          | Open schema event log                                                                       |

## Cross-cutting plugins

### `applyBasePlugins(schema, { softDelete?, paginate? })`

Every collection (except a few ephemeral ones) gets:

1. **`jsonTransformPlugin`** — renames `_id` to `id`, strips `__v` and private fields.
2. **`paginatePlugin`** — adds `Model.paginate(filter, options)` returning `{ items, meta }`.
3. **`softDeletePlugin`** — adds `deletedAt`, instance `softDelete()` / `restore()`, and a query middleware that auto-filters deleted documents unless `{ withDeleted: true }` is passed.

### Soft-delete escape hatch

```ts
// Default — only live documents
await User.find({ status: 'active' });

// Include soft-deleted
await User.find({}).setOptions({ withDeleted: true });

// Only soft-deleted
await User.findDeleted();
```

## Repository layer

All repositories live in `apps/backend/src/repositories/`. The `BaseRepository<T>` exposes lean reads, pagination, and safe updates. Concrete repositories add domain helpers — e.g.:

```ts
import { productRepository, userRepository, orderRepository } from '@/repositories';

await productRepository.findBySlug('iphone-15-pro-max-256gb-black');
await userRepository.findByEmail('me@example.com', { includePassword: true });
await orderRepository.revenueBetween(startOfDay, endOfDay);
```

## Indexes (highlights)

```text
users           : email (unique), role+status+createdAt, externalIds.google (sparse), ...
sessions        : tokenHash (unique), userId+revokedAt, expiresAt (TTL)
products        : sku (unique), slug (unique), name/desc/brandName/tags (text, weighted),
                  status+primaryCategoryId+createdAt, status+brandId+createdAt,
                  status+isFeatured+createdAt, status+isBestSeller+salesCount,
                  status+price.amount, status+rating.average+rating.count
orders          : orderNumber (unique), userId+placedAt, status+placedAt,
                  paymentStatus+placedAt, fulfillmentStatus+placedAt
inventory       : productId+variantId+warehouseCode (unique), available+reorderLevel
stores          : location (2dsphere), address.countryCode+address.city
coupons         : code (unique), isActive+startsAt+expiresAt
reviews         : productId+userId (unique), productId+status+rating+createdAt
auditLogs       : actorId+createdAt, targetType+targetId+createdAt
searchHistory   : normalizedQuery+createdAt, userId+createdAt
```

The full index list is enumerated in each `*.model.ts` file.

## Seeding

```bash
pnpm --filter @twinspire/backend db:seed   # populate sample data
pnpm --filter @twinspire/backend db:reset  # drop the entire database (dev only)
```

The seed creates:

- 16 permissions, 5 roles
- 50 users (4 staff + 46 customers)
- 12 brands
- 24 categories (6 roots × ~3 subcategories)
- ~110 products (3-4 variants per template across 6 categories)
- 5 coupons
- 1 active campaign + 1 hero banner
- 8 FAQs

## Integration tests

Each model that has business logic ships a `*.integration.test.ts` file using
`mongodb-memory-server`. They are excluded from `pnpm test` by default. Run with:

```bash
pnpm --filter @twinspire/backend test:integration
```

> First-time runs download a MongoDB binary (~250 MB) into the user cache.
