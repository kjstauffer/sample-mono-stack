import { createTestUser } from '../mysql/testing/user.js';
import prisma from '../prisma.js';

describe(`Error Tests`, () => {
  test(`Create a user without a password`, async () => {
    await expect(createTestUser({ password: `` })).rejects.toThrow(`invalidPassword`);
  });
});

describe(`Success Tests`, () => {
  test(`Create a user`, async () => {
    const user = await createTestUser({ password: `validPassword` });

    const reloadedUser = await prisma.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    });

    expect(user).toMatchObject(reloadedUser);
  });
});
