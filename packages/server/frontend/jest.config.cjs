module.exports = {
  ...require(`../../../testing/jest-server.cjs`),
  displayName: `s:frontend`,
  setupFilesAfterEnv: [`<rootDir>/src/testing/setup.ts`],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(j|t)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json', useESM: true }],
    '^.+\\.cjs$': `babel-jest`,
  },
};
