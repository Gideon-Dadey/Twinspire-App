# Local setup

## 1. Prerequisites

| Tool    | Version   | Install                                                            |
| ------- | --------- | ------------------------------------------------------------------ |
| Node.js | `22.x`    | https://nodejs.org or `nvm install` then `nvm use`                 |
| pnpm    | `>=9.0`   | `corepack enable && corepack prepare pnpm@9.12.3 --activate`       |
| Docker  | `>=24`    | https://docs.docker.com/get-docker/                                |
| Git     | `>=2.40`  | OS package manager                                                 |

## 2. Clone & install

```bash
git clone <repo-url> twinspire
cd twinspire
pnpm install
```

Husky is configured automatically via `pnpm prepare`. Pre-commit hooks run Prettier
and ESLint; commit messages are validated by `commitlint` (Conventional Commits).

## 3. Configure environment

```bash
# Root file (used by docker-compose if you customize defaults)
cp .env.example .env

# Backend
cp .env.example apps/backend/.env

# Frontend
cp .env.example apps/frontend/.env.local
```

For development, the only secrets you must set are placeholders — the schema
validator will accept the dev-only secrets shipped in `apps/backend/.env.example`.

## 4. Start infrastructure

```bash
pnpm infra:up
```

This starts the dev stack:

| Service           | Port    | URL                          |
| ----------------- | ------- | ---------------------------- |
| MongoDB           | 27017   | `mongodb://localhost:27017`  |
| Redis             | 6379    | `redis://localhost:6379`     |
| Elasticsearch     | 9200    | http://localhost:9200        |
| Kibana (profile)  | 5601    | http://localhost:5601        |
| Mailhog SMTP      | 1025    | (SMTP)                       |
| Mailhog UI        | 8025    | http://localhost:8025        |
| MinIO (S3 dev)    | 9000/01 | http://localhost:9001        |

Kibana is opt-in: `docker compose --profile tools up -d kibana`.

## 5. Run the apps

```bash
pnpm dev
```

This runs every workspace with a `dev` script in parallel via Turborepo.

- Frontend: http://localhost:3000
- Backend:  http://localhost:4000/api/v1/health

## 6. Useful commands

```bash
pnpm lint           # ESLint across the monorepo
pnpm typecheck      # tsc --noEmit
pnpm test           # Jest unit + integration
pnpm test:e2e       # Playwright (frontend) — requires apps/frontend running
pnpm build          # Production build
pnpm format         # Prettier write
pnpm format:check   # Prettier check (used in CI)
```

## 7. Troubleshooting

**`pnpm install` fails with peer dependency warnings.**
Run with `--strict-peer-dependencies=false` or trust the `.npmrc` defaults.

**Elasticsearch container fails to start.**
Increase Docker's memory limit (≥ 4 GB) or comment out the service if not needed
for Phase 1.

**Port 3000 / 4000 already in use.**
Change `PORT` in the relevant `.env` file. Both apps respect their own port.

**JWT secret too short error on backend startup.**
Backend env validation rejects secrets shorter than 32 chars. Use a long
placeholder for dev, e.g.
`openssl rand -hex 32`.
