/**
 * Babel config file used throughout the entire project.
 *
 * The default is to output ES modules. Some environments, like `test`, will change to CommonJS.
 * If CommonJS is needed from other scripts or processes, pass in the Babel env as `commonjs`.
 */

module.exports = (api) => {
  const shouldOutputCommonJS = /^test|commonjs$/.test(api.env());

  const presets = [
    [`@babel/react`, { useSpread: true, runtime: `automatic`, importSource: `@emotion/react` }],
    [`@babel/preset-typescript`, { onlyRemoveTypeImports: true }],
  ];

  const plugins = [`macros`, `@emotion/babel-plugin`, `@babel/transform-runtime`, `babel-plugin-transform-import-meta`];

  if (api.env() === `development`) {
    plugins.push(`react-refresh/babel`);
  }

  if (api.env() === `test`) {
    /* Server side uses class properties and uses Babel during testing. */
    plugins.push(`@babel/proposal-class-properties`);

    plugins.unshift(`babel-plugin-transform-typescript-metadata`, [
      `@babel/plugin-proposal-decorators`,
      { legacy: true },
    ]);
  }

  if (shouldOutputCommonJS) {
    presets.unshift([
      `@babel/preset-env`,
      {
        targets: {
          node: `18.17.0`,
        },
      },
    ]);
  } else {
    presets.unshift([
      `@babel/env`,
      {
        /* Don't transform any modules since all targeted browsers support modules. */
        modules: false,
        corejs: `3`,
        useBuiltIns: `usage`,
        bugfixes: true,
        targets: {
          browsers: [
            `last 2 Chrome versions`,
            `not Chrome < 75`,
            `last 2 Safari versions`,
            `not Safari < 12`,
            `last 2 iOS versions`,
            `not iOS < 12`,
            `last 2 Firefox versions`,
            `not Firefox < 66`,
            `last 2 Edge versions`,
            `not Edge < 18`,
          ],
        },
      },
    ]);
  }

  return { presets, plugins };
};
