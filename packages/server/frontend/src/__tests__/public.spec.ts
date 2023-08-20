import { jest } from '@jest/globals';
import config from 'config';
import supertest, { type Response as SuperAgentResponse } from 'supertest';
import type { User } from '@prisma/client';
import type { Callback, RedisKey } from 'ioredis';
import type { Logger } from 'winston';

import { app } from '../apps/public.js';
import { createTestUser } from '../model/mysql/testing/user.js';
import { mockData } from '../testing/mockData.js';
import { apiCookieName, getQualifiedSessionId } from '../utils/session.js';
import { getAuthenticatedUserQuery } from '../graphql/public/User/__tests__/gql.js';
import type { Response } from '../testing/types.js';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';
import prisma from '../model/prisma.js';

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
 * Authenticate a user (this will hit the express `/auth` endpoint)
 */
const authenticateUserPost = ({
  variables,
}: {
  variables: { username: string; password: string };
}) =>
  supertest
    .agent(app)
    .post(`/auth`)
    .set(`Origin`, config.get<string>(`domain`))
    .set(`Accept`, `application/json`)
    .send(variables);

/**
 * Authenticate a user as XMLHttpRequest (this will hit the express `/auth` endpoint)
 */
const authenticateUserPostXhr = ({
  variables,
}: {
  variables: { username: string; password: string };
}) =>
  supertest
    .agent(app)
    .post(`/auth`)
    .set(`Origin`, config.get<string>(`domain`))
    .set(`Accept`, `application/json`)
    .set(`X-Requested-With`, `XMLHttpRequest`)
    .send(variables);

/**
 * Authenticate a user w/out Origin (this will hit the express `/auth` endpoint)
 */
const authenticateUserPostNoOrigin = ({
  variables,
}: {
  variables: { username: string; password: string };
}) => supertest.agent(app).post(`/auth`).set(`Accept`, `application/json`).send(variables);

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
  test(`Authenticate with an empty user`, async () => {
    await authenticateUserPost({
      variables: {
        username: ``,
        password: ``,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(`Unauthorized`);
      });
  });

  test(`Authenticate with an empty user - CORS - w/domain port`, async () => {
    jest.spyOn(config, `has`).mockImplementation((_key: string) => {
      return true;
    });

    jest.spyOn(config, `get`).mockImplementation((_key: string) => {
      return 443;
    });

    await authenticateUserPost({
      variables: {
        username: ``,
        password: ``,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(`Unauthorized`);
      });
  });

  test(`Authenticate with an empty user - CORS - No origin`, async () => {
    await authenticateUserPostNoOrigin({
      variables: {
        username: ``,
        password: ``,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(`Unauthorized`);
      });
  });

  test(`Authenticate with an unknown user`, async () => {
    await authenticateUserPost({
      variables: {
        username: `badUser`,
        password: `badPassword`,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(`Unauthorized`);
      });
  });

  test(`Authenticate a known user w/bad password`, async () => {
    await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    await authenticateUserPost({
      variables: {
        username: `validUser`,
        password: `badPassword`,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(`Unauthorized`);
      });
  });

  test(`Get authenticated user with an invalid session User ID`, async () => {
    await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    /* Set a mocked session. */
    await redis.set(
      REDIS_SESSION_ID,
      `invalid_user_id`,
      `EX`,
      Math.round((Date.now() + EXPIRY_TIME_IN_MS) / 1000),
    );

    await getAuthenticatedUserPost().then(({ body: { errors } }: Response) => {
      expect(errors).toBeDefined();
      expect(errors[0].message).toMatch(/Not Allowed/);
    });
  });

  test(`Get authenticated user with a missing session`, async () => {
    await getAuthenticatedUserPost().then(({ body: { errors } }: Response) => {
      expect(errors).toBeDefined();
      expect(errors[0].message).toMatch(/Not Allowed/);
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
      expect(errors[0].message).toMatch(/Not Allowed/);
    });
  });

  test(`GraphQL Codegen: Get authenticated user with an invalid key`, async () => {
    const getGQLPost = () =>
      supertest.agent(app).post(`/`).send({ query: getAuthenticatedUserQuery });

    await getGQLPost()
      .set(`gql-codegen-key`, `invalid-key`)
      .then(({ body: { errors } }: Response) => {
        expect(errors).toHaveLength(1);
        expect(errors[0].message).toMatch(/Not Allowed/);
      });
  });

  test(`Authenticate a known user w/valid credentials w/maximum sessionId collisions`, async () => {
    const user = await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    /**
     * The following ensures that every check, to see if the session already exists, will be `true`.
     * An error will be thrown after a certain number tries to find a unique session ID.
     */
    jest
      .spyOn(redis, `get`)
      .mockImplementation((_key: RedisKey, _cb: Callback<string | null> | undefined) => {
        return Promise.resolve(JSON.stringify({ userId: user.id }));
      });

    await authenticateUserPost({
      variables: {
        username: `validUser`,
        password: `validPassword`,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(`Unauthorized`);
      });
  });

  test(`Redis fails while authenticating a known user`, async () => {
    await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    /**
     * The following ensures that every check, to see if the session already exists, will be `true`.
     * An error will be thrown after a certain number tries to find a unique session ID.
     */
    jest
      .spyOn(redis, `get`)
      .mockImplementationOnce((_key: RedisKey, _cb: Callback<string | null> | undefined) => {
        redis.emit(`error`, new Error(`mockRedisError`));
        return Promise.reject(`mockRedisError`);
      });

    /**
     * To prevent output pollution, this simply prevents the logger from emitting an error to
     * console during tests. This will be invoked when the above `redis.emit` is invoked.
     */
    jest.spyOn(logger, `error`).mockImplementationOnce((_infoObject: object): Logger => {
      logger.error = () => {
        return logger;
      };

      return logger;
    });

    /* Assert any non-XHR request returns an error (non-JSON). */
    await authenticateUserPost({
      variables: {
        username: `validUser`,
        password: `validPassword`,
      },
    })
      .expect(500)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          `Something failed!`,
        );
      });
  });

  test(`Authentication exception using XHR`, async () => {
    await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    /* Mock the `findFirst` query method, ensuring it fails so Express can handle the error */
    jest.spyOn(prisma.user, `findFirst`).mockImplementationOnce(() => {
      throw new Error(`mockRedisError`);
    });

    /* Assert an XHR request returns a JSON string. */
    await authenticateUserPostXhr({
      variables: {
        username: `validUser`,
        password: `validPassword`,
      },
    })
      .expect(500)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          `{"error":"Something failed!"}`,
        );
      });
  });
});

describe(`Success Tests`, () => {
  test(`Authenticate a known user w/valid credentials`, async () => {
    await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    await authenticateUserPost({
      variables: {
        username: `validUser`,
        password: `validPassword`,
      },
    })
      .expect(200)
      .then(({ body: { ok } }: SuperAgentResponse) => {
        expect(ok).toBe(true);
      });
  });

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

    const user = await createTestUser({
      username: `validUser`,
      password: `validPassword`,
      email: `validUser@${mockData.domain}`,
    });

    await assertUser(user);

    const user2 = await createTestUser({
      username: `validUser2`,
      password: `validPassword2`,
      email: `validUser2@${mockData.domain}`,
      name: null,
    });

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
