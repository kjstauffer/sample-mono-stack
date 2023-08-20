/**
 * The base Jest config use by all packages in the project.
 */

module.exports = {
  // transform: {
  //   '^.+\\.(j|t)sx?$': `babel-jest`,
  // },
  transform: {},
  // resetMocks: true,
  moduleFileExtensions: [
    `ts`,
    `tsx`,
    `js`,
    `jsx`,
    /* d.ts must be after ALL other TypeScript and JavaScript extensions. */
    `d.ts`,
    `json`,
  ],
  collectCoverageFrom: [
    `**/src/**/*.{ts,tsx}`,
    `!**/index.ts`,
    `!**/types.ts`,
    `!**/types/**`,
    `!**/node_modules/**`,
    `!**/src/testing/**`,
    `!**/src/**/scripts/**`
  ],
  // testTimeout: 5000,
  coverageDirectory: `<rootDir>/coverage`,
  coverageProvider: `babel`,
  coverageReporters: [`lcov`, `text-summary`],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  projects: [
    // `packages/client/frontend/jest.config.cjs`,
    `packages/server/frontend/jest.config.cjs`,
  ],
  watchPlugins: [
    `jest-watch-select-projects`,
    `jest-watch-typeahead/filename`,
    `jest-watch-typeahead/testname`,
  ],
};
