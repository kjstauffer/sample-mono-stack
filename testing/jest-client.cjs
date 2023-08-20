/**
 * Base Jest config settings for all client packages.
 *
 * <rootDir> throughout this file will point to the individual package's directory.
 */

/**
 * Jest needs CommonJS. So, we have to load a tsconfig file that outputs CommonJS
 * when loading the config.
 */
const path = require(`path`);
process.env.TS_NODE_PROJECT = path.resolve(`tsconfig.commonjs.json`);
const config = require(`config`);

module.exports = {
  globals: {
    CONFIG: config,
  },
  roots: [`<rootDir>/src`],
  testRegex: `(/__tests__/.*\\.(spec|test))\\.tsx?$`,
  testEnvironment: `jsdom`,
  setupFilesAfterEnv: [`@testing-library/jest-dom`],
  // setupFilesAfterEnv: [`@testing-library/jest-dom`, `<rootDir>/../../../testing/immerSetup.ts`],
};
