import { jest } from '@jest/globals';
import config from 'config';
import supertest from 'supertest';
import type { User } from '@prisma/client';

import { app } from '../../../../apps/public.js';
import { createTestUser } from '../../../../model/mysql/testing/user.js';
import { apiCookieName, getQualifiedSessionId } from '../../../../utils/session.js';
import { getAuthenticatedUserQuery } from '../../../../graphql/public/User/__tests__/gql.js';
import type { Response } from '../../../../testing/types.js';
import { redis } from '../../../../utils/redis.js';

const SESSION_ID = `TEST_SESSION_ID`;
const REDIS_SESSION_ID = getQualifiedSessionId(SESSION_ID);
const EXPIRY_TIME_IN_MS = 10000;

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  await redis.del(REDIS_SESSION_ID);
  jest.restoreAllMocks();
});

/**
 * Set an authenticated user cookie and call the `getAuthenticatedUserQuery` graphql resolver.
 */
const getAuthenticatedUserPost = () =>
  supertest
    .agent(app)
    .post(`/`)
    .set(`Origin`, config.get<string>(`domain`))
    .set(`cookie`, `${apiCookieName}=${SESSION_ID}; Path=/; HttpOnly; Secure; SameSite=None`)
    .send({ query: getAuthenticatedUserQuery });

describe(`Error Tests`, () => {
  test(`Get authenticated user with an invalid session User ID`, async () => {
    await createTestUser();

    /* Set a mocked session. */
    await redis.set(
      REDIS_SESSION_ID,
      `invalid_user_id`,
      `EX`,
      Math.round((Date.now() + EXPIRY_TIME_IN_MS) / 1000),
    );

    await getAuthenticatedUserPost().then(({ body: { errors } }: Response) => {
      expect(errors).toBeDefined();
      expect(errors[0].message).toMatch(/notAllowed/);
    });
  });

  test(`Get authenticated user with a missing session`, async () => {
    await getAuthenticatedUserPost().then(({ body: { errors } }: Response) => {
      expect(errors).toBeDefined();
      expect(errors[0].message).toMatch(/notAllowed/);
    });
  });

  test(`Get authenticated user with a missing user ID in session`, async () => {
    /** Set a mocked session with an invalid value. */
    await redis.set(
      REDIS_SESSION_ID,
      ``,
      `EX`,
      Math.round((Date.now() + EXPIRY_TIME_IN_MS) / 1000),
    );

    await getAuthenticatedUserPost().then(({ body: { errors } }: Response) => {
      expect(errors).toBeDefined();
      expect(errors[0].message).toMatch(/notAllowed/);
    });
  });

  test(`GraphQL Codegen: Get authenticated user with an invalid key`, async () => {
    const getGQLPost = () =>
      supertest.agent(app).post(`/`).send({ query: getAuthenticatedUserQuery });

    await getGQLPost()
      .set(`gql-codegen-key`, `invalid-key`)
      .then(({ body: { errors } }: Response) => {
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/notAllowed/);
      });
  });
});

describe(`Success Tests`, () => {
  test(`Get authenticated user with a valid cookie/session`, async () => {
    const assertUser = async (user: User) => {
      /* Set a mocked session. */
      await redis.set(
        REDIS_SESSION_ID,
        JSON.stringify({ userId: user.id }),
        `EX`,
        Math.round((Date.now() + EXPIRY_TIME_IN_MS) / 1000),
      );

      const name = user.name ?? ``;

      await getAuthenticatedUserPost().then(({ body: { data, errors } }: Response) => {
        expect(errors).toBeUndefined();
        expect(data.getAuthenticatedUser.user.id).toBe(`${user.id}`);
        expect(data.getAuthenticatedUser.user.name).toBe(name);
      });
    };

    const user = await createTestUser();
    await assertUser(user);

    const user2 = await createTestUser({ name: null });
    await assertUser(user2);
  });

  test(`GraphQL Codegen: Get authenticated user with a valid key`, async () => {
    const getGQLPost = () =>
      supertest.agent(app).post(`/`).send({ query: getAuthenticatedUserQuery });

    const gqlCodegenKey = config.get<string>(`gqlCodegenKey`);

    await getGQLPost()
      .set(`gql-codegen-key`, gqlCodegenKey)
      .expect(200)
      .then(({ body: { data, errors } }: Response) => {
        expect(errors).toBeUndefined();
        expect(data.getAuthenticatedUser.user).toHaveProperty(`id`);
        expect(data.getAuthenticatedUser.user).toHaveProperty(`name`);
      });
  });
});
