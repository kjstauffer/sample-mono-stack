import type { Prisma } from '@prisma/client';

import prisma from '../../prisma.js';
import { getMockData } from '../../../testing/mockData.js';

/**
 * Create a User that can be used in testing.
 * @param fields Pass in any additional fields to be set OR to override the defaults.
 */
const createTestUser = async (fields?: Partial<Prisma.UserUncheckedCreateInput>) => {
  const mockData = getMockData();

  const user = await prisma.user.create({
    data: {
      ...mockData.user,
      posts: {
        create: { title: `As you wish` },
      },
      profile: {
        create: { bio: `Bounty Hunter` },
      },
      ...fields,
    },
  });

  return user;
};

export { createTestUser };
