import { Redis } from 'ioredis';
import config from 'config';

import { logger } from './logger.js';

const host = config.get<string>(`redis.host`);
const port = config.get<number>(`redis.port`);
const db = config.get<number>(`redis.sessionDatabase`);

/* istanbul ignore if: just a failsafe */
if (!host || typeof port !== `number` || typeof db !== `number`) {
  throw new Error(`Redis is not configured properly. Check config settings.`);
}

const redis = new Redis({ host, port, db });

redis.on(`error`, (err) => {
  logger.error(err);
});

export { redis };
