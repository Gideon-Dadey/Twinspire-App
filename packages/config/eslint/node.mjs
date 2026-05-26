import globals from 'globals';

import { base } from './base.mjs';

/** @type {import('eslint').Linter.Config[]} */
export const node = [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      'no-process-exit': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
];

export default node;
