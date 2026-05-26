# TwinSpire — Architecture

> Status: Phase 1 (Foundation) complete. Subsequent phases extend the diagram below.

## 1. High-level diagram

```
                ┌──────────────────────────────────────────────────────────┐
                │                          Browser                          │
                └──────────────────────────────────────────────────────────┘
                                          │
                                  HTTPS   │
                                          ▼
                                ┌──────────────────┐
                                │      NGINX       │  ◀── infrastructure/nginx
                                │ (TLS, rate-limit,│
                                │  caching, gzip)  │
                                └──────────────────┘
                                          │
                ┌─────────────────────────┴─────────────────────────┐
                ▼                                                   ▼
       ┌────────────────────┐                            ┌──────────────────────┐
       │  Next.js 15 (SSR)  │   internal HTTP            │   Express 5 API       │
       │  apps/frontend     │ ────────────────────────▶  │   apps/backend        │
       │  · App Router      │                            │   · /api/v1/...       │
       │  · React 19        │                            │   · Zod-validated env │
       │  · Tailwind + UI   │                            │   · Pino + req-id     │
       │  · TanStack Query  │                            │   · Helmet + rate-lim │
       │  · Zustand         │                            │                       │
       └────────────────────┘                            └──────────────────────┘
                │                                                   │
                ▼                                                   ▼
       ┌────────────────────┐                            ┌──────────────────────┐
       │   @twinspire/ui    │                            │ MongoDB · Redis · ES │
       │   tokens + comps   │                            │ (Phases 2-4)         │
       └────────────────────┘                            └──────────────────────┘
```

## 2. Monorepo layout

```
apps/
  frontend/          Next.js 15 App Router — customer + admin SPA
  backend/           Express + TypeScript REST API
packages/
  ui/                Design tokens, Tailwind preset, shared React primitives
  types/             Shared TypeScript domain + API types (no runtime deps)
  utils/             Shared pure helpers (format, slug, result, pagination)
  config/            Shared TS / ESLint / Prettier presets
infrastructure/
  docker/            Production multi-stage Dockerfiles
  nginx/             Production reverse-proxy config
docs/                Architecture, setup, deployment guides
scripts/             Operational scripts (Phase 10)
```

## 3. Phase 1 deliverables in this repo

| Layer            | Component                | File / directory                                   |
| ---------------- | ------------------------ | -------------------------------------------------- |
| Monorepo         | Workspaces               | `pnpm-workspace.yaml`, `package.json`              |
| Build            | Turborepo task pipeline  | `turbo.json`                                       |
| TS / lint        | Shared presets           | `packages/config/{tsconfig,eslint}`                |
| Domain types     | API + entities           | `packages/types/src/**`                            |
| Utilities        | Formatters, slug, result | `packages/utils/src/**`                            |
| Design tokens    | Colors, type, spacing    | `packages/ui/src/tokens.ts`                        |
| Tailwind theme   | Preset + globals.css     | `packages/ui/tailwind.preset.cjs` + `globals.css`  |
| Backend skeleton | App + middleware         | `apps/backend/src/{app.ts,server.ts,middleware/*}` |
| Backend env      | Zod-validated config     | `apps/backend/src/config/env.ts`                   |
| Health endpoint  | Liveness + readiness     | `apps/backend/src/routes/health.ts`                |
| Frontend         | Layout + homepage        | `apps/frontend/src/app/**`                         |
| Providers        | Theme + Query + Toaster  | `apps/frontend/src/components/providers/**`        |
| API client       | Typed fetch wrapper      | `apps/frontend/src/lib/api-client.ts`              |
| Local infra      | Mongo, Redis, ES, etc.   | `docker-compose.yml`                               |
| Production infra | Dockerfiles + NGINX      | `infrastructure/**`                                |
| CI               | Lint / typecheck / build | `.github/workflows/ci.yml`                         |

## 4. Cross-cutting concerns

### Logging
- **Backend**: `pino` with ISO timestamps and PII redaction (cookies, tokens, passwords).
- **Per request**: `pino-http` attaches `req.log` and the `X-Request-Id` header round-trips through NGINX → Express → frontend.

### Errors
- `HttpError` is the only error type intentionally exposed.
- Zod validation errors are mapped to `422 VALIDATION_ERROR` automatically.
- 5xx errors never leak internal messages to clients in production.

### Security baseline (Phase 1)
- `helmet` with strict CSP in production.
- CORS allowlist driven by `CORS_ORIGINS`.
- `cookie-parser` with signed cookies via `COOKIE_SECRET`.
- `express-rate-limit` global + per-route in Phase 3.
- `hpp` to neutralize HTTP-parameter pollution.
- Compression after security headers, before responses.

### Performance
- `output: 'standalone'` for slim frontend container.
- Next.js Image with AVIF/WebP and a tight remote allowlist.
- `prefer-offline` pnpm installs with mount-cached store in Docker.
- HTTP keep-alive between NGINX and upstreams.

## 5. Out of scope for Phase 1 (intentional)

| Concern                | Phase  |
| ---------------------- | ------ |
| MongoDB models / seeds | 2      |
| Real auth flows        | 3      |
| Stripe / PayPal        | 4      |
| Shadcn primitives      | 5      |
| Public catalog pages   | 6      |
| User dashboard         | 7      |
| Admin dashboard        | 8      |
| Playwright E2E suite   | 9      |
| Production deployment  | 10     |
