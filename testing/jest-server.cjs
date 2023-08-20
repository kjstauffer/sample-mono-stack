/**
 * Base Jest config settings for all server packages.
 *
 * <rootDir> throughout this file will point to the individual package's directory.
 */

module.exports = {
  roots: [`<rootDir>/src`],
  testRegex: `(/__tests__/.*\\.(spec|test))\\.ts$`,
  testEnvironment: `node`,
};
