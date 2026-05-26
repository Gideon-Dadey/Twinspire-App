import { react } from '@twinspire/config/eslint/react';

export default [
  {
    ignores: [
      'tailwind.preset.cjs',
      '__mocks__/**',
      'dist/**',
      'node_modules/**',
      'storybook-static/**',
      '.storybook/**',
      'vite.config.ts',
    ],
  },
  ...react,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
