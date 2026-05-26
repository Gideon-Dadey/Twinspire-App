import { node } from '@twinspire/config/eslint/node';

export default [
  ...node,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
