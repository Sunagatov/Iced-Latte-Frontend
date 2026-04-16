const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/.next/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  watchPathIgnorePatterns: ['<rootDir>/.next/'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  reporters: [
    'default',
    ['jest-sonar', { outputName: 'jest-sonar-coverage-report.xml' }],
  ],
  preset: 'ts-jest',
  collectCoverage: true,
  coverageReporters: ['lcov', 'clover'],
  clearMocks: true,
  globals: {
    fetch,
  },
}

module.exports = createJestConfig(customJestConfig)
