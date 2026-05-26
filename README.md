# TwinSpire

Production-grade enterprise electronics e-commerce platform.

> Phase 1 of 10 is implemented in this repo. See [`docs/phases.md`](./docs/phases.md) for the full roadmap and current status.

## Highlights

- **Monorepo** powered by **pnpm workspaces** + **Turborepo**
- **Frontend** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Shadcn UI · TanStack Query · Zustand · Framer Motion · React Hook Form · Zod
- **Backend** — Node.js · Express · TypeScript · Pino · Zod · Helmet · Mongoose · Redis · Elasticsearch · S3
- **Database** — MongoDB Atlas / Mongoose ODM
- **Auth** — JWT access + refresh rotation · RBAC · 2FA · Social login
- **Payments** — Stripe · PayPal · pluggable local providers
- **Search** — Elasticsearch with autocomplete + suggestions
- **Caching** — Redis (rate-limit, sessions, search cache)
- **Observability** — Structured logging, request IDs, audit logs, health/readiness probes
- **CI/CD** — GitHub Actions · Docker multi-stage builds · NGINX reverse proxy

## Repository layout

```
.
├── apps/
│   ├── frontend/                # Next.js 15 customer + admin SPA
│   └── backend/                 # Express 5 REST API
├── packages/
│   ├── ui/                      # Design tokens + shared components (Phase 5)
│   ├── types/                   # Shared TypeScript domain + API types
│   ├── utils/                   # Shared pure helpers (format, slug, result)
│   └── config/                  # Shared tsconfig, eslint, tailwind presets
├── infrastructure/
│   ├── docker/                  # App Dockerfiles
│   └── nginx/                   # Production reverse-proxy config
├── docs/                        # Architecture, setup, deployment, roadmap
├── scripts/                     # Operational scripts
├── docker-compose.yml           # Local dev stack: Mongo · Redis · ES · Mailhog · MinIO
├── turbo.json                   # Turborepo task pipeline
├── pnpm-workspace.yaml          # Workspace definitions
└── tsconfig.base.json           # Shared TS compiler options
```

## Prerequisites

| Tool         | Version    | Why                              |
| ------------ | ---------- | -------------------------------- |
| Node.js      | `>=20.11`  | Runtime (LTS recommended: 22.x)  |
| pnpm         | `>=9.0`    | Package manager                  |
| Docker       | `>=24`     | Local infra (Mongo, Redis, ES)   |
| Git          | `>=2.40`   | Version control + Husky hooks    |

Use `nvm use` to pick the version pinned in [`.nvmrc`](./.nvmrc).

## Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Bring up local infrastructure (Mongo, Redis, Elasticsearch, Mailhog, MinIO)
pnpm infra:up

# 3. Copy env templates
cp .env.example apps/backend/.env
cp .env.example apps/frontend/.env.local

# 4. Run everything in dev mode
pnpm dev
```

Then open:

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000/api/v1/health
- Mailhog  → http://localhost:8025
- MinIO    → http://localhost:9001 (login: `twinspire` / `twinspire-secret`)
- Kibana   → http://localhost:5601 (start with `docker compose --profile tools up -d kibana`)

## Top-level scripts

| Script              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | Run every app in watch mode in parallel                    |
| `pnpm build`        | Production build of every workspace                        |
| `pnpm lint`         | Run ESLint across the monorepo                             |
| `pnpm typecheck`    | Run `tsc --noEmit` across every TS project                 |
| `pnpm test`         | Run unit + integration test suites                         |
| `pnpm test:e2e`     | Run Playwright end-to-end tests                            |
| `pnpm format`       | Format the entire repo with Prettier                       |
| `pnpm infra:up`     | Start Docker dev infrastructure                            |
| `pnpm infra:down`   | Stop dev infrastructure                                    |
| `pnpm infra:reset`  | Stop infra and **wipe all volumes** (destructive)          |

## Documentation

- [`docs/architecture.md`](./docs/architecture.md) — System architecture & data flow
- [`docs/setup.md`](./docs/setup.md) — Detailed local setup guide
- [`docs/phases.md`](./docs/phases.md) — Phased build plan + current status

## License

Proprietary. All rights reserved.
