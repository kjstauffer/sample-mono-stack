import type { User } from '@prisma/client';

import type { RequestCookies } from '../../types.js';
import { compareHash } from '../../utils/crypt.js';
import prisma from '../prisma.js';
import { getSession } from '../../utils/session.js';

/**
 * `User` model business logic & functions
 */

/**
 * Return the user that has a `username` and `password` matching the given inputs.
 */
export type AuthenticateUserInput = {
  /** User's user name */
  username: string;

  /** User's password */
  password: string;
};
const authenticateUser = async ({ username, password }: AuthenticateUserInput) => {
  /* Fetch user to authenticate */
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  /* Verify */
  if (!user || !(await compareHash(password, user.password))) {
    return;
  }

  return user;
};

/**
 * Given request's cookies, find & return the authenticated user.
 */
export type FindAuthenticatedUserInput = {
  /** The cookies from the request. */
  cookies: RequestCookies;
};
const findAuthenticatedUser = async ({
  cookies,
}: FindAuthenticatedUserInput): Promise<User | undefined | null> => {
  const session = await getSession({ cookies });

  if (!session) {
    return;
  }

  const { userId } = session;

  return prisma.user.findFirst({
    where: {
      id: parseInt(userId, 10),
    },
  });
};

export { authenticateUser, findAuthenticatedUser };
