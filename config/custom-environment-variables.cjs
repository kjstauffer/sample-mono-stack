/**
 * Provides a mapping to get environment variables into the config structure.
 * If the environment variable is present it will override all other settings.
 * @see https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables
 *
 * Any mapping made here must be explicitly removed inside each client webpack config. This will
 * prevent sensitive data from being exposed in client builds.
 *
 * Example - In the webpack config, for each sensitive key, add:
 *  - `delete configObject.keyToBeDeleted;`
 */

// const customEnvVars = {
// };

// export default customEnvVars;
