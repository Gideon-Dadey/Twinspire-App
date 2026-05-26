# Catalog — Products, Categories, Brands

The catalog module exposes the public product catalog plus admin CRUD. All
endpoints sit under `/api/v1/catalog`.

## Models

| Model      | Collection   | Notes                                                         |
| ---------- | ------------ | ------------------------------------------------------------- |
| `Product`  | `products`   | SKU + slug unique, soft-delete, rich attributes & variants    |
| `Category` | `categories` | Nested via `parentId`/`ancestors`/`path`, soft-delete         |
| `Brand`    | `brands`     | Slug-keyed, soft-delete, supports a logo & website            |

## Public endpoints

| Method | Path                                              | Description                                                                 |
| ------ | ------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/catalog/products`                               | Paginated list with facets (brands, categories, price range, ratings, tags) |
| GET    | `/catalog/products/featured`                      | Hand-picked featured products                                               |
| GET    | `/catalog/products/best-sellers`                  | Best-sellers ordered by `salesCount`                                        |
| GET    | `/catalog/products/new-arrivals`                  | New arrivals ordered by release date                                        |
| GET    | `/catalog/products/:slug`                         | Single product (404 if not published)                                       |
| GET    | `/catalog/products/:slug/related`                 | Related products in the same primary category                               |
| GET    | `/catalog/categories`                             | Full category tree (300-second cache)                                       |
| GET    | `/catalog/categories/:slug`                       | Category + breadcrumb (`[...ancestors, target]`)                            |
| GET    | `/catalog/brands`                                 | All active brands (300-second cache)                                        |
| GET    | `/catalog/brands/:slug`                           | Single brand                                                                |

### Filters supported on `/catalog/products`

| Query param | Type      | Notes                                                       |
| ----------- | --------- | ----------------------------------------------------------- |
| `q`         | string    | Mongo text-search on `name`, `description`, `brandName`, `tags` |
| `category`  | slug      | Filters by category slug                                    |
| `brand`     | csv slugs | Comma-separated brand slugs (max 20)                        |
| `minPrice`  | number    | Inclusive lower bound for `price.amount`                    |
| `maxPrice`  | number    | Inclusive upper bound for `price.amount`                    |
| `condition` | enum      | `new` \| `refurbished` \| `open_box` \| `used`              |
| `inStock`   | bool      | Restricts to `in_stock`, `low_stock`, `preorder`            |
| `tag`       | string    | Single tag filter                                           |
| `rating`    | number    | Minimum average rating                                      |
| `sort`      | enum      | `newest` \| `price-asc` \| `price-desc` \| `rating` \| `popular` \| `name` |
| `page`      | number    | Default `1`, max `500`                                      |
| `limit`     | number    | Default `24`, max `60`                                      |

### Facets

For every product listing the API also returns a `facets` block:

```json
{
  "facets": {
    "brands":   [{ "id": "...", "name": "Acme", "slug": "acme", "count": 12 }],
    "priceRange": { "min": 19.99, "max": 1299.0 },
    "conditions": [{ "value": "new", "count": 88 }],
    "ratings":  [{ "rating": 4, "count": 23 }],
    "tags":     [{ "tag": "wireless", "count": 41 }]
  }
}
```

Facets ignore the user's current price/brand/condition/rating filter so the
sidebar can always show the *complete* set of options.

## Admin endpoints

All admin routes require a Bearer token with `manager` (create/update) or
`admin` (delete) role.

| Method | Path                                          | Role guard |
| ------ | --------------------------------------------- | ---------- |
| POST   | `/catalog/admin/products`                     | manager    |
| PATCH  | `/catalog/admin/products/:productId`          | manager    |
| DELETE | `/catalog/admin/products/:productId`          | admin      |
| POST   | `/catalog/admin/categories`                   | manager    |
| PATCH  | `/catalog/admin/categories/:categoryId`       | manager    |
| DELETE | `/catalog/admin/categories/:categoryId`       | admin      |
| POST   | `/catalog/admin/brands`                       | manager    |
| PATCH  | `/catalog/admin/brands/:brandId`              | manager    |
| DELETE | `/catalog/admin/brands/:brandId`              | admin      |

Constraints:

* Categories cannot be deleted while they have children or products.
* Brands cannot be deleted while they have products.
* Soft-delete (`deletedAt`) is used for products and categories so historical
  orders keep referencing valid documents.

## Caching

* `GET /catalog/products` — 60s response cache keyed on the normalised filter
  shape and pagination params.
* `GET /catalog/categories` — 300s tree cache, invalidated on admin writes.
* `GET /catalog/brands` — 300s list cache, invalidated on admin writes.

Cache keys are namespaced under `catalog:*` in Redis.

## Search alternative

For deep keyword/faceted search, prefer the dedicated `/search` endpoint
(Elasticsearch-backed). The catalog list endpoint is optimised for
category/brand browsing.
