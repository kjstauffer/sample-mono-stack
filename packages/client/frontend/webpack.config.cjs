/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * These ENV settings are needed for the project config to get loaded properly.
 * An alternate tsconfig is needed to get commonjs from the config files.
 */
process.env.TS_NODE_PROJECT = `../../../tsconfig.commonjs.json`;
var path = require(`path`);

const webpack = require(`webpack`);
const config = require(`config`);
const { WebpackManifestPlugin } = require(`webpack-manifest-plugin`);
const ForkTsCheckerWebpackPlugin = require(`fork-ts-checker-webpack-plugin`);
const { BundleAnalyzerPlugin } = require(`webpack-bundle-analyzer`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
// const ScriptExtHtmlWebpackPlugin = require(`script-ext-html-webpack-plugin`);
const WorkboxPlugin = require(`workbox-webpack-plugin`);
const CopyWebpackPlugin = require(`copy-webpack-plugin`);
const WorkerPlugin = require(`worker-plugin`);
const ReactRefreshWebpackPlugin = require(`@pmmmwh/react-refresh-webpack-plugin`);

const configObject = config.util.toObject();

/**
 * Prevent sensitive information from being compiled into the client app.
 * Any values in the `./config` that should be kept private should have their
 * keys removed from `configObject`.
 */
// delete configObject.someSecretKey;

const { URL_PATHS } = require(`./src/static/urlPaths`);

module.exports = (env, argv) => {
  const module = {
    entry: `./src/index`,
    node: false,
    resolve: {
      extensions: [`.ts`, `.tsx`, `.js`],
    },
    stats: `errors-only`,
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: `style-loader`,
              options: { esModule: true },
            },
            {
              loader: `css-loader`,
              options: { esModule: true },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: `babel-loader`,
              options: {
                configFile: `../../../babel.config.js`,
                envName: env.production ? `production` : `development`,
              },
            },
          ],
        },
        {
          test: /\.(woff(2)?|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: `asset/resource`,
          generator: {
            filename: `fonts/[name][ext]`,
          },
        },
      ],
    },
  };

  /**
   * Enabling profiling allows the React DevTools browser extension profiling to work.
   */
  if (env.enableProfiling) {
    module.resolve.alias[`react-dom$`] = `react-dom/profiling`;
    module.resolve.alias[`scheduler/tracing`] = `scheduler/tracing-profiling`;
  }

  const plugins = [
    new webpack.DefinePlugin({
      CONFIG: JSON.stringify(configObject),
      URL_PATHS: JSON.stringify(URL_PATHS),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: `static`,
      openAnalyzer: false,
      excludeAssets: env.production || argv.mode === `production` ? null : /main.js/,
    }),
    new HtmlWebpackPlugin({
      template: `public/index.html`,
    }),
    // new ScriptExtHtmlWebpackPlugin({
    //   /* Add `type="module"` to JS files included in index.html (all of them start with `main`) */
    //   module: `main`,
    // }),
    new WorkerPlugin(),
  ];

  if (env.development || argv.mode === `development`) {
    module.output = {
      path: `${__dirname}/build`,
      publicPath: `/`,
      filename: `main.js`,
      globalObject: `self`,
    };

    module.devtool = `source-map`;

    const domain = config.get(`domain`);
    module.devServer = {
      allowedHosts: `all`,
      historyApiFallback: true,
      hot: true,
      host: `0.0.0.0`,
      port: 5000,
      client: {
        overlay: {
          warnings: true,
          errors: true,
        },
        webSocketURL: `auto://frontend.${domain}`,
      },
      // devMiddleware: {
      //   publicPath: `/`,
      // },
    };

    plugins.push(
      new ReactRefreshWebpackPlugin({ overlay: false }),
      new ForkTsCheckerWebpackPlugin()
    );
  }

  if (env.production || argv.mode === `production`) {
    module.devtool = false;
    module.performance = {
      hints: false,
    };

    module.output = {
      path: `${__dirname}/build/app/frontend/`,
      publicPath: `/app/frontend/`,
      filename: `main.[chunkhash].js`,
      globalObject: `self`,
    };

    module.optimization = {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: `vendors`,
            chunks: `all`,
          },
        },
      },
    };

    plugins.push(
      new WorkboxPlugin.GenerateSW({
        /**
         * These options encourage the ServiceWorkers to get in there fast
         * and not allow any straggling "old" SWs to hang around.
         *
         * Only include the code fonts that that are used.
         * Without this, the service worker will cache every version of the font.
         */
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: `/index.html`,
        navigateFallbackDenylist: [/^\/static\//],
        include: [/\.(js|html|ico|svg)$/, /open-sans-latin-(4|7)00.*\.woff2?$/],
      }),
      new CopyWebpackPlugin({ patterns: [`public/manifest.json`, `public/robots.txt`] }),
      new WebpackManifestPlugin({
        fileName: `asset-manifest.json`,
      })
    );
  }

  module.plugins = plugins;

  return module;
};
