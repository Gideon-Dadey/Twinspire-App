/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['prettier --write', 'eslint --fix --max-warnings=0'],
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
};
