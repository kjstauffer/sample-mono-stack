import type { IncomingHttpHeaders } from 'http';

import type { User } from '@prisma/client';
import type { Response } from 'express';
import type { ContextFunction } from '@apollo/server';
import type { ExpressContextFunctionArgument } from '@apollo/server/express4';

import type { apiCookieName } from './utils/session.js';
import type { ExtendedPrismaClient } from './model/prisma.js';

/**
 * Additional HTTP Headers added by the Reverse Proxy.
 */
type ProxyHeaders = `x-real-ip` | `x-forwarded-for` | `x-forwarded-host`;

/**
 * Combine the default HTTP headers with the Reverse Proxy headers
 */
export type RequestHeaders = IncomingHttpHeaders & {
  [K in ProxyHeaders]: string;
};

/**
 * All the possible cookies that could be in any request to the server.
 */
export type RequestCookies = {
  [apiCookieName]?: string;
};

/**
 * The Apollo context function type
 */
export type SetupContext = ContextFunction<[ExpressContextFunctionArgument]>;

/**
 * Context fields common to all GraphQL endpoints.
 */
type CommonContext = {
  /** Pass in all the headers from the request, which are often needed for logging/tracking. */
  requestHeaders: RequestHeaders;

  /** The cookies from the incoming request. */
  cookies: RequestCookies;
};

/**
 * Context for the `public` endpoint. Available in `public` resolvers.
 */
export type ApiServerContext = CommonContext & {
  /** Passed around so the mutations can set cookies as needed. */
  res: Response;

  /** Prisma database client */
  prisma: ExtendedPrismaClient;

  /** The authenticated User */
  authUser: User;
};
