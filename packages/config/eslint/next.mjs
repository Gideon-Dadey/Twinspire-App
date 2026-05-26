import { react } from './react.mjs';

/**
 * Next.js ESLint flat config.
 *
 * Note: Next.js 15's `next lint` still loads `eslint-config-next` via the
 * legacy `.eslintrc` path. To stay flat-config-native, we let consumers
 * compose `next/core-web-vitals` via `FlatCompat` in their local
 * `eslint.config.mjs` if they need it.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const next = [
  ...react,
  {
    rules: {
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    },
  },
];

export default next;
