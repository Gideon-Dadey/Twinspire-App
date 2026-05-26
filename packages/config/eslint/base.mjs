import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Base ESLint flat config for TwinSpire.
 * Extend with `node.mjs`, `react.mjs`, or `next.mjs` for environment-specific rules.
 * @type {import('eslint').Linter.Config[]}
 */
export const base = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.config.{js,mjs,cjs,ts}',
      '**/jest.*.{ts,cjs,js,mjs}',
      '**/jest.setup.{ts,cjs,js,mjs}',
      '**/storybook-static/**',
      '**/.storybook/**',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.es2023 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'smart'],
      curly: ['error', 'multi-line'],
    },
  },
  prettierConfig,
];

export default base;
