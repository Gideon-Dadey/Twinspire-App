# Search — `/api/v1/search`

The search module wraps **Elasticsearch** when configured, and gracefully
falls back to Mongo full-text search when it is not — so the storefront
always returns *something*.

## Endpoints

| Method | Path                          | Auth     | Description                              |
| ------ | ----------------------------- | -------- | ---------------------------------------- |
| GET    | `/search`                     | public   | Faceted product search                   |
| GET    | `/search/suggest`             | public   | Type-ahead suggestions                   |
| POST   | `/search/admin/reindex`       | admin    | Rebuild the product index from MongoDB   |

### Search query params

```
q           required, 1–120 chars
page        default 1
limit       default 24, max 60
sort        relevance|newest|price-asc|price-desc|rating|popular
category    category name (Elasticsearch keyword)
brand       comma-separated brand names
minPrice    inclusive lower bound
maxPrice    inclusive upper bound
rating      min average rating
inStock     boolean
```

### Response shape

```jsonc
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "65a...",
        "sku": "...",
        "name": "Headphones",
        "slug": "headphones",
        "brandName": "Acme",
        "price": 199,
        "currency": "USD",
        "rating": 4.7,
        "ratingCount": 128,
        "thumbnail": "https://...",         // mongo fallback only
        "highlight": { "name": "<em>Head</em>phones" }  // ES only
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 24,
    "pages": 2,
    "facets": {
      "brands":     [{ "name": "Acme", "count": 12 }],
      "categories": [{ "name": "Audio", "count": 30 }],
      "priceRange": { "min": 19.99, "max": 1299 },
      "ratings":    [{ "rating": 4, "count": 12 }]
    },
    "source": "elasticsearch"               // or "mongo"
  }
}
```

## Elasticsearch index

* Index name: `ELASTICSEARCH_PRODUCT_INDEX` (default `twinspire-products`).
* Field mappings:
  * `name` — `text` + `name.keyword`
  * `slug`, `sku`, `brandName`, `tags`, `categoryNames`, `condition`,
    `status`, `stockStatus`, `currency` — `keyword`
  * `price`, `rating` — `double`
  * `ratingCount`, `salesCount` — `integer`
  * `isFeatured`, `isBestSeller`, `isNewArrival` — `boolean`
  * `createdAt` — `date`

### Rebuilding the index

```bash
curl -X POST http://localhost:4000/api/v1/search/admin/reindex \
     -H "Authorization: Bearer <admin-token>"
```

The bulk reindex walks `Product` in `_id`-ordered batches of 500. Brand and
category lookups are batched per document so the resulting ES document
includes resolved names (used for `keyword`-typed facet aggregations).

### Index lifecycle hooks

The `SearchIndexer.indexProduct` and `deleteProduct` helpers are wired so
that admin product mutations can keep the index live. They no-op when
Elasticsearch is not configured.

## Mongo fallback

When `ELASTICSEARCH_URL` is empty or the ES client throws, the service
delegates to `productRepository.paginate` with a `$text` filter. Facets are
empty in this mode — clients should not depend on them for the storefront
sidebar when ES is offline.

## Health

The `/health/ready` endpoint surfaces Elasticsearch alongside Mongo and
Redis when configured.
