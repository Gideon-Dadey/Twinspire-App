/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/style-mock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.json', useESM: false, diagnostics: false },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/e2e/'],
};
