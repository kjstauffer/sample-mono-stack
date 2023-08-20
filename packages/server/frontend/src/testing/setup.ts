/* eslint-disable @typescript-eslint/naming-convention */

import type { PrismaPromise } from '@prisma/client';

import { redis } from '../utils/redis.js';
import prisma from '../model/prisma.js';

afterAll(async () => {
  await redis.quit();

  /* Explicitly disconnect redis or Jest will hang after running tests. */
  redis.disconnect();
});

(function () {
  beforeEach(async () => {
    const transactions: PrismaPromise<unknown>[] = [];

    /* Turn off foreign key checks. */
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);

    /* Grab all table names in the database. */
    const tableNames = await prisma.$queryRaw<
      Array<{ TABLE_NAME: string }>
    >`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'sample';`;

    /* Purge all data from every table. */
    for (const { TABLE_NAME } of tableNames) {
      if (TABLE_NAME !== `_prisma_migrations`) {
        try {
          transactions.push(prisma.$executeRawUnsafe(`TRUNCATE ${TABLE_NAME};`));
        } catch (error) {
          console.log({ error });
        }
      }
    }

    /* Turn on foreign key checks. */
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);

    /* Execute the transaction. */
    try {
      await prisma.$transaction(transactions);
    } catch (error) {
      console.log({ error });
    }
  });
})();
