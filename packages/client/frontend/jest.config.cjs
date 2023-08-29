/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-var-requires */

const jestConfig = require(`../../../testing/jest-client`);
const { URL_PATHS } = require(`~client-frontend/static/urlPaths`);

module.exports = {
  ...jestConfig,
  globals: {
    ...jestConfig.globals,
    URL_PATHS,
  },
  displayName: `c:frontend`,
  setupFiles: [`<rootDir>/src/testing/setup.ts`],
  // moduleNameMapper: {
  //   '\\.(css|less)$': `<rootDir>/__mocks__/styleMock.js`,
  // },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(j|t)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json', useESM: true }],
    '^.+\\.cjs$': `babel-jest`,
  },
};
