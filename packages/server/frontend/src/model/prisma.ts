import config from 'config';
import { Prisma, PrismaClient } from '@prisma/client';

import { encryptPassword } from '../utils/crypt.js';

/**
 * Adds a prisma extension that hashes the password field
 * when creating a new user.
 */
const createUserExt = Prisma.defineExtension({
  name: `create-user`,
  query: {
    user: {
      async create({ args, query }) {
        const { password } = args.data;

        const encryptedPassword = await encryptPassword(password);

        if (!encryptedPassword) {
          throw new Error(`invalidPassword`);
        }

        args.data.password = encryptedPassword;

        return query(args);
      },
    },
  },
});

/**
 * Return a new PrismaClient object.
 */
function getPrismaClient(database?: string) {
  const dbName = database ?? process.env.DB_NAME;
  const dbHost = config.get<string>(`mysql.host`);

  /* istanbul ignore if: testing will never hit this */
  if (!dbName) {
    throw new Error(`invalidDatabase`);
  }

  const url = `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${dbHost}:${process.env.DB_PORT}/${dbName}?schema=public`;

  return new PrismaClient({
    // log: [`query`, `info`, `warn`, `error`],
    datasources: {
      db: {
        url,
      },
    },
  }).$extends(createUserExt);
}

export type ExtendedPrismaClient = ReturnType<typeof getPrismaClient>;

/* Store the prisma client here to prevent multiple connections during hot-reloads */
const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const setPrismaClient = () => {
  const prisma = globalForPrisma.prisma ?? getPrismaClient();

  /* istanbul ignore if: testing will never hit this */
  if (process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`) {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
};

const prisma = setPrismaClient();

// eslint-disable-next-line import/no-default-export
export default prisma;
