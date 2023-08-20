/**
 * Rules used only for client side packages
 */

module.exports = {
  extends: `.eslintrc.cjs`,
  parserOptions: {
    project: `./tsconfig.eslint.json`,
  },
  rules: {},
};
