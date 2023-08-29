/**
 * The core URL paths used throughout the entire system. This should not be an exhaustive list of
 * ALL URL paths possible. Rather just the main entry points in to various parts of the system
 * that will need to be linked to from various parts of the system.
 *
 * No trailing slashes on any paths.
 *
 * @note for the React app: Changes here are not available until Webpack restarts completely.
 * To trigger a restart, simply `touch` the `webpack.config.js` file.
 */

const URL_PATHS = {
  /* URL paths for the `admin` app. */
  admin: {
    root: `/admin`,
  },
} as const;

export type UrlPaths = typeof URL_PATHS;

export { URL_PATHS };
