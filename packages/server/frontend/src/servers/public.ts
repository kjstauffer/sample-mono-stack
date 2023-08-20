/* istanbul ignore file */
import { createServer } from 'http';

import config from 'config';

import { logger } from '../utils/logger.js';
import { app } from '../apps/public.js';

const port = config.get<number>(`serverPorts.public`);

createServer(app).listen(port, () => {
  logger.info(`🚀 Ready on port ${port}`);
});
