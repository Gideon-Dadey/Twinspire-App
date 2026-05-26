# syntax=docker/dockerfile:1.7
# =============================================================================
# TwinSpire — Frontend (Next.js 15) production image
# Multi-stage build, non-root user, standalone output for minimal size.
# =============================================================================

ARG NODE_VERSION=22.11.0-alpine

# -----------------------------------------------------------------------------
# Stage 1: Base — install pnpm
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /repo

# -----------------------------------------------------------------------------
# Stage 2: Dependencies
# -----------------------------------------------------------------------------
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY turbo.json tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/
COPY apps/backend/package.json apps/backend/
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
COPY --from=deps /repo/apps ./apps
COPY --from=deps /repo/packages ./packages
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline --ignore-scripts
RUN pnpm --filter @twinspire/frontend... build

# -----------------------------------------------------------------------------
# Stage 4: Runner — minimal Next.js standalone server
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js `output: 'standalone'` ships only what's needed.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "apps/frontend/server.js"]
