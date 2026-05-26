/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  globalSetup: process.env.RUN_INTEGRATION ? '<rootDir>/jest.global-setup.cjs' : undefined,
  testTimeout: process.env.RUN_INTEGRATION ? 120_000 : 30_000,
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: process.env.RUN_INTEGRATION ? [] : ['\\.integration\\.test\\.ts$'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.json' }],
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts', '!src/index.ts'],
  coverageDirectory: 'coverage',
};
