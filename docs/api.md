# TwinSpire HTTP API

> Phase 3 deliverable. REST API mounted at `${API_PREFIX}` (default `/api/v1`).

## Conventions

- **Success envelope**

  ```json
  { "success": true, "data": <T>, "meta": { ... } }
  ```

- **Error envelope**

  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TOKEN",
      "message": "Invalid or expired access token",
      "details": { ... },
      "requestId": "ckxxxxx"
    }
  }
  ```

- Every response carries the `X-Request-Id` header — also echoed back when the
  client provides one. Use it when reporting issues.
- All timestamps are ISO 8601 with offsets (`2026-05-25T22:43:00.000Z`).
- All money values are objects: `{ amount: number, currency: string }`.

## Authentication

- The default scheme is **`Authorization: Bearer <accessToken>`** on every
  protected route.
- The refresh token rides on the signed HTTP-only cookie `ts_rt` (scoped to
  `${API_PREFIX}/auth`) — clients never need to read it. See [`auth.md`](./auth.md).

## Common HTTP status codes

| Status | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| 200    | OK                                                            |
| 201    | Resource created (`POST` of a new entity)                     |
| 204    | Success, no content (revoke, delete, idempotent write)        |
| 400    | Bad request (logical, malformed)                              |
| 401    | Missing / invalid credentials                                 |
| 403    | Authenticated but lacking the required role or permission     |
| 404    | Resource doesn't exist                                        |
| 409    | Conflict (duplicate email, optimistic-lock failure)           |
| 422    | Validation failed (`details` will be a list of field issues)  |
| 429    | Rate-limited or account-locked                                |
| 500    | Unhandled internal error (never expose sensitive details)     |
| 503    | Readiness check failed (DB or cache down)                     |

## Versioning

The current API version is `v1`, embedded in the URL. Breaking changes will be
shipped as `v2` while `v1` continues to be served at the same URL.

## OpenAPI 3.1

A live, machine-readable spec is generated from the Zod request schemas:

- Spec JSON: `${API_PREFIX}/docs/openapi.json`
- Interactive Swagger UI: `${API_PREFIX}/docs`

Swagger is enabled by default in development and can be toggled in production
via `ENABLE_SWAGGER=false`.

## Health

| Method | Path              | Purpose                                            |
| ------ | ----------------- | -------------------------------------------------- |
| GET    | `/health`         | Liveness — always 200 as long as the process runs  |
| GET    | `/health/ready`   | Readiness — pings Mongo and Redis. 503 if degraded |

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 4231,
    "timestamp": "2026-05-25T22:43:00.000Z",
    "version": "0.1.0",
    "environment": "production",
    "checks": {
      "process": { "status": "ok" },
      "database": { "status": "ok", "latencyMs": 2 },
      "cache": { "status": "ok", "latencyMs": 1 },
      "search": { "status": "ok", "message": "Not wired until Phase 4" }
    }
  }
}
```

## Routes

| Module       | Mount                          | Docs                       |
| ------------ | ------------------------------ | -------------------------- |
| Health       | `${API_PREFIX}/health*`        | [api.md](#health)          |
| Auth         | `${API_PREFIX}/auth/*`         | [auth.md](./auth.md)       |
| Users        | `${API_PREFIX}/users/*`        | see below                  |
| Docs         | `${API_PREFIX}/docs/*`         | Swagger UI                 |

### Users

| Method | Path                                  | Purpose                          |
| ------ | ------------------------------------- | -------------------------------- |
| GET    | `/users/me`                           | Get profile                      |
| PATCH  | `/users/me`                           | Update profile                   |
| PATCH  | `/users/me/preferences`               | Update preferences (locale, etc) |
| DELETE | `/users/me`                           | Soft-delete the account          |
| GET    | `/users/me/addresses`                 | List addresses                   |
| POST   | `/users/me/addresses`                 | Create address                   |
| PATCH  | `/users/me/addresses/:addressId`      | Update address                   |
| DELETE | `/users/me/addresses/:addressId`      | Delete address (soft)            |
| POST   | `/users/me/addresses/:addressId/default` | Make the default address      |

All `/users/*` routes require `Authorization: Bearer <accessToken>`.

## Request validation

All inbound bodies, queries, and path params are parsed by **Zod** schemas via
the `validate` middleware. On failure the API returns

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "path": "password", "code": "too_small", "message": "String must contain at least 12 character(s)" }
    ]
  }
}
```

with HTTP **422 Unprocessable Entity**.

## CORS

Allowed origins are controlled by the `CORS_ORIGINS` env var (comma-separated;
use `*` to allow any). Cookies are credentialed; `Access-Control-Allow-Credentials`
is set to `true` for all allowed origins.

## Rate limiting

See [`auth.md`](./auth.md#rate-limiting). All limiters use the
[draft-7](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/)
RateLimit headers; the legacy headers are off.
