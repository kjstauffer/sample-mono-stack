'use strict'

/* All supported environment names */
const DevEnv = {
  MAIN: `main`,
};

/* The development domain. */
const domain = `sample-mono-stack.dev`;

/* The auth key to make authorized requests against the API. */
const apiAuthKey = `A_VERY_LONG_RANDOM_STRING_HERE`;

/* Allows client-side GraphQL codegen requests */
const gqlCodegenKey = `A_VERY_LONG_RANDOM_STRING_HERE`;

/* Development environment. */
const devEnv = DevEnv.MAIN;

/* MySQL database connection info */
const mysql = {
  host: `sample-mono-stack.dev`,
  username: `root`,
  password: `root`,
  database: `sample`,
};

/**
 * ------------------------------------------------------------------------------------------------
 * ------------------------------------------------------------------------------------------------
 * ------------------------------------------------------------------------------------------------
 *
 * NO CHANGES BEYOND THIS POINT (unless you know what you're doing)
 *
 * ------------------------------------------------------------------------------------------------
 * ------------------------------------------------------------------------------------------------
 * ------------------------------------------------------------------------------------------------
 */

module.exports = {
  devEnv,
  domain,
  apiAuthKey,
  gqlCodegenKey,
  mysql,

  redis: {
    host: `redis`,
    port: 6379,
  },
};
