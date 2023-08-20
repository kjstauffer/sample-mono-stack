const ONE_DAY_IN_SECONDS = 86400;

module.exports = {
  api: {
    public: {
      hostname: `frontend-api`,
    },
  },
  authCookieExpireSeconds: ONE_DAY_IN_SECONDS,
  redis: {
    port: 6379,
    /* Redis has 16 distinct databases, numbered 0-15 */
    sessionDatabase: 0,
  },
  serverPorts: {
    public: 3000,
  },
  sessionPrefix: `sample-mono-stack-session:`,
};
