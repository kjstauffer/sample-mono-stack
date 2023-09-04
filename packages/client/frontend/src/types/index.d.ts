import type { UrlPaths } from './urlPaths';

/**
 * Declarations in this global block will be global to every package in this repo.
 * Meaning, they can be used without needing to import anything.
 */
declare global {
  /**
   * The Webpack config makes the URL_PATHS variable globally available.
   * This type makes it work throughout the source code.
   */
  const URL_PATHS: UrlPaths;
}
