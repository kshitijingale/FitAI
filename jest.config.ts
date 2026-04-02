// jest.config.ts
// Jest is the test runner. ts-jest lets it understand TypeScript.

import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // This maps @/* imports to src/* — same as tsconfig paths
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathPattern: ['src/__tests__'],
  setupFilesAfterFramework: [],
}

export default config
