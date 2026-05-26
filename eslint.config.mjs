/**
 * Root ESLint flat config.
 *
 * Each workspace ships its own `eslint.config.mjs` that extends the
 * appropriate preset from `@twinspire/config/eslint/*`. This root config
 * is the catch-all for repo-level scripts, configs, and orphan files.
 */
import { base } from './packages/config/eslint/base.mjs';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      'apps/**',
      'packages/**',
    ],
  },
  ...base,
];
