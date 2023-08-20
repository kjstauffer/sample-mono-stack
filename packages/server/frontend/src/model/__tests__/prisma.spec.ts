import { createTestUser } from '../mysql/testing/user.js';
import { mockData } from '../../testing/mockData.js';
import prisma from '../prisma.js';

describe(`Error Tests`, () => {
  test(`Create a user without a password`, async () => {
    await expect(
      createTestUser({
        username: `validUser`,
        password: ``,
        email: `validUser@${mockData.domain}`,
      }),
    ).rejects.toThrow(`invalidPassword`);
  });
});

describe(`Success Tests`, () => {
  test(`Create a user`, async () => {
    const user = await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    const reloadedUser = await prisma.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    });

    expect(user).toMatchObject(reloadedUser);
  });
});
