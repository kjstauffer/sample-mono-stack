import path from 'path';

import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { getDirname } from './getDirname.js';

const { combine, colorize, timestamp, printf, json } = format;

/**
 * Centralized logger and helpers for use by any of the server packages.
 */

/**
 * Setup and return a winston logger.
 * @param name The directory to use for the output log.
 */
const setupLogger = (name: string) => {
  const env = process.env.NODE_ENV;

  const logger = winston.createLogger();
  const dirname = getDirname();

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (env) {
    /* istanbul ignore next: can't happen in test */
    case `development`:
      {
        /* Need to get to `logs` at the the repo root relative to this file. */
        const logPath = path.join(dirname, `../../../../../logs`);

        logger.add(
          new DailyRotateFile({
            format: combine(timestamp(), json()),
            filename: `${logPath}/${name}/%DATE%.log`,
            datePattern: `YYYY-MM-DD`,
            maxFiles: `30d`,
            handleExceptions: true,
            createSymlink: true,
          }),
        );
      }

      break;

    /* istanbul ignore next: can't happen in test */
    case `production`:
      logger.add(
        new winston.transports.Console({
          level: `info`,
          stderrLevels: [`error`],
          handleExceptions: true,
          format: combine(timestamp(), json()),
        }),
      );

      break;

    /* no default */
  }

  if (env !== `production`) {
    logger.add(
      new winston.transports.Console({
        level: `info`,
        format: combine(
          colorize(),
          timestamp(),
          printf(
            /* istanbul ignore next: can't figure out how to mock and test this. */
            (info) =>
              `${String(info.timestamp)} [${info.level}] ${JSON.stringify(
                info.message,
                undefined,
                2,
              )}`,
          ),
        ),
      }),
    );
  }

  // return {
  //   info: logger.info.bind(logger),
  //   error: logger.error.bind(logger),
  // };

  return logger;
};

const logger = setupLogger(`server-frontend`);

export { logger };
