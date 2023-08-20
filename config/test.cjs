'use strict'

module.exports = {
  domain: `mock-sample-mono-stack.dev`,
  apiAuthKey: `DOES_NOT_MATTER_IN_TESTING`,
  gqlCodegenKey: `GQL_TESTING_KEY`,
  mysql: {
    host: `127.0.0.1`,
    username: `root`,
    password: `root`,
    database: `sample`,
  },
  redis: {
    host: `redis`,
    port: 6379,
  },
};
