import { base } from '@twinspire/config/eslint/base';

export default [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
