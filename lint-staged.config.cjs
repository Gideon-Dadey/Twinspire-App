/**
 * lint-staged configuration
 *
 * Prettier handles formatting on commit (the binary lives at the repo root
 * via the root devDependency).
 *
 * ESLint is intentionally NOT invoked here. In a pnpm workspace monorepo
 * each app/package owns its own ESLint install + config (apps/frontend,
 * apps/backend, packages/ui all configure their own rules). A root-level
 * `eslint --fix` cannot resolve the per-workspace binary on every shell,
 * and the per-app configs would not be picked up correctly anyway.
 *
 * Linting runs in CI and locally via `pnpm -w lint` (turbo fans out to
 * every workspace) — which is the source of truth for lint correctness.
 *
 * @type {import('lint-staged').Config}
 */
module.exports = {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['prettier --write'],
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};
