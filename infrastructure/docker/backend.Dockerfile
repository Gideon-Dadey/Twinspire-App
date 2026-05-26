# syntax=docker/dockerfile:1.7
# =============================================================================
# TwinSpire — Backend (Express + TypeScript) production image
# =============================================================================

ARG NODE_VERSION=22.11.0-alpine

# -----------------------------------------------------------------------------
# Stage 1: Base
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /repo

# -----------------------------------------------------------------------------
# Stage 2: Dependencies
# -----------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY turbo.json tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/ui/package.json packages/ui/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/config/package.json packages/config/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# -----------------------------------------------------------------------------
# Stage 3: Build
# -----------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts
RUN pnpm --filter @twinspire/backend... build

# Strip dev dependencies for the production image.
RUN pnpm --filter @twinspire/backend deploy --prod --legacy /out

# -----------------------------------------------------------------------------
# Stage 4: Runner
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production \
    PORT=4000 \
    HOST=0.0.0.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 api && \
    apk add --no-cache curl tini

COPY --from=builder --chown=api:nodejs /out/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /repo/apps/backend/dist ./dist
COPY --from=builder --chown=api:nodejs /repo/apps/backend/package.json ./package.json

USER api
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl --fail --silent http://localhost:4000/api/v1/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
