module.exports = {
  extends: `../../../.eslintrc.cjs`,
  parserOptions: {
    project: `./tsconfig.eslint.json`,
    tsconfigRootDir: __dirname,
  },
  rules: {
    /**
     * With the exception of the pattern in the first group, this rule is identical across all
     * packages. If changes are made here, make sure they are also made everywhere else.
     */
    'import/order': [
      `error`,
      {
        groups: [`builtin`, `external`, `internal`, `parent`, `sibling`, `index`],
        'newlines-between': `always`,
        pathGroups: [
          {
            pattern: `~client-frontend/**`,
            group: `internal`,
            position: `after`,
          },
          {
            pattern: `~*/**`,
            group: `internal`,
            position: `before`,
          },
        ],
      },
    ],
  },
};
