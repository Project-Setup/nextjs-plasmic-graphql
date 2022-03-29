const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('@jest/types').Config.InitialOptions} */
const customJestConfig = {
  rootDir: '../',
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testRegex: '__tests__/.*\\.test\\.tsx?$',
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
