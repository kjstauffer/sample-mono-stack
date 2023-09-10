import config from 'config';
import type { User } from '@prisma/client';

import type { RequestCookies } from '../types.js';

import { generateEncryptionKey } from './crypt.js';
import { redis } from './redis.js';

/* Describes what session data will look like. */
type SessionValue = {
  userId: string;
};

/* The cookie name that stores the session ID. */
const apiCookieName = `api_session`;

/**
 * Prepend the session's prefix to the session ID.
 */
const getQualifiedSessionId = (sessionId: string) =>
  `${config.get<string>(`sessionPrefix`)}${sessionId}`;

/**
 * Assert a given session ID exists
 */
const isValidSession = async (sessionId: string) => {
  return !!(await redis.exists(sessionId));
};

/**
 * Retrieve a session for an authenticated user.
 */
type GetSessionInput = {
  cookies: RequestCookies;
};
const getSession = async ({ cookies }: GetSessionInput) => {
  const sessionId = cookies[apiCookieName];

  if (!sessionId || !(await isValidSession(getQualifiedSessionId(sessionId)))) {
    return;
  }

  const sessionJSON = await redis.get(getQualifiedSessionId(sessionId));

  if (!sessionJSON) {
    return;
  }

  try {
    return JSON.parse(sessionJSON) as SessionValue;
  } catch (err) {
    return;
  }
};

/**
 * Create a session for an authenticated user.
 */
type SetSessionInput = {
  user: User;
};
const setSession = async ({ user }: SetSessionInput) => {
  let sessionId = generateEncryptionKey();
  let session = await redis.get(getQualifiedSessionId(sessionId));

  /* Prevent session collision in the off-chance the generated sessionId is not unique. */
  const threshold = 10;
  let count = 0;
  while (session && count < threshold) {
    sessionId = generateEncryptionKey();
    // eslint-disable-next-line no-await-in-loop
    session = await redis.get(getQualifiedSessionId(sessionId));
    count += 1;
  }

  if (count >= threshold) {
    return;
  }

  const sessionValue = JSON.stringify({ userId: user.id });

  await redis.set(getQualifiedSessionId(sessionId), sessionValue, `EX`, 60000);

  return sessionId;
};

export { apiCookieName, getQualifiedSessionId, setSession, getSession };
