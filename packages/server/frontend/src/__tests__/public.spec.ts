import { jest } from '@jest/globals';
import config from 'config';
import supertest, { type Response as SuperAgentResponse } from 'supertest';
import type { Callback, RedisKey } from 'ioredis';
import type { Logger } from 'winston';

import { app } from '../apps/public.js';
import { createTestUser } from '../model/mysql/testing/user.js';
import { getQualifiedSessionId } from '../utils/session.js';
import { redis } from '../utils/redis.js';
import { logger } from '../utils/logger.js';
import prisma from '../model/prisma.js';
import { mockPassword } from '../testing/mockData.js';

const SESSION_ID = `TEST_SESSION_ID`;
const REDIS_SESSION_ID = getQualifiedSessionId(SESSION_ID);

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
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          JSON.stringify({ error: `unauthorized` }),
        );
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
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          JSON.stringify({ error: `unauthorized` }),
        );
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
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          JSON.stringify({ error: `unauthorized` }),
        );
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
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          JSON.stringify({ error: `unauthorized` }),
        );
      });
  });

  test(`Authenticate a known user w/bad password`, async () => {
    const newUser = await createTestUser();

    await authenticateUserPost({
      variables: {
        username: newUser.username,
        password: `badPassword`,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          JSON.stringify({ error: `unauthorized` }),
        );
      });
  });

  test(`Authenticate a known user w/valid credentials w/maximum sessionId collisions`, async () => {
    const newUser = await createTestUser();

    /**
     * The following ensures that every check, to see if the session already exists, will be `true`.
     * An error will be thrown after a certain number tries to find a unique session ID.
     */
    jest
      .spyOn(redis, `get`)
      .mockImplementation((_key: RedisKey, _cb: Callback<string | null> | undefined) => {
        return Promise.resolve(JSON.stringify({ userId: newUser.id }));
      });

    await authenticateUserPost({
      variables: {
        username: newUser.username,
        password: mockPassword,
      },
    })
      .expect(401)
      .then(({ error }: SuperAgentResponse) => {
        expect((error as Exclude<SuperAgentResponse[`error`], false>).text).toBe(
          JSON.stringify({ error: `unauthorized` }),
        );
      });
  });

  test(`Redis fails while authenticating a known user`, async () => {
    const newUser = await createTestUser();

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

    /* Assert any non-XHR request returns an error. */
    await authenticateUserPost({
      variables: {
        username: newUser.username,
        password: mockPassword,
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
    const newUser = await createTestUser();

    /* Mock the `findFirst` query method, ensuring it fails so Express can handle the error */
    jest.spyOn(prisma.user, `findFirst`).mockImplementationOnce(() => {
      throw new Error(`mockRedisError`);
    });

    /* Assert an XHR request returns a JSON string. */
    await authenticateUserPostXhr({
      variables: {
        username: newUser.username,
        password: mockPassword,
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
    const newUser = await createTestUser();

    await authenticateUserPost({
      variables: {
        username: newUser.username,
        password: mockPassword,
      },
    })
      .expect(200)
      .then(({ body: { user } }: SuperAgentResponse) => {
        expect(user).toMatchObject({
          id: newUser.id,
          name: newUser.name,
        });
      });
  });
});
