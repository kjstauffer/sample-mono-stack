import config from 'config';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import type { User } from '@prisma/client';
import { GraphQLError } from 'graphql';

import prisma from '../model/prisma.js';
import type { RequestHeaders, SetupContext, ApiServerContext, RequestCookies } from '../types.js';
import { schema } from '../graphql/public/schema.js';
import { corsOptions } from '../utils/cors.js';
import { formatApolloError } from '../utils/errorHandler.js';
import { authenticateUser, findAuthenticatedUser } from '../model/mysql/User.js';
import { asyncRoute } from '../utils/express.js';
import { apiCookieName, getSession, setSession } from '../utils/session.js';
import { logger } from '../utils/logger.js';

type GetApiServerContextArgs = {
  requestHeaders: RequestHeaders;
  cookies: RequestCookies;
  res: Response;
  authUser: User;
};

const getApiServerContext = async ({
  requestHeaders,
  cookies,
  res,
  authUser,
}: GetApiServerContextArgs): Promise<ApiServerContext> => {
  const apiServerContext: ApiServerContext = {
    requestHeaders,
    cookies,
    res,
    prisma,
    authUser,
  };

  return Promise.resolve(apiServerContext);
};

const setupContext: SetupContext = async ({ req, res }): Promise<ApiServerContext> => {
  /* Authenticate an HTTP request. */
  const cookies = req.cookies as RequestCookies;
  const requestHeaders = req.headers as RequestHeaders;

  const authUser = await findAuthenticatedUser({ cookies });

  if (authUser) {
    return getApiServerContext({
      requestHeaders,
      cookies,
      res,
      authUser,
    });
  }

  /* Allow client site GraphQL codegen through if the correct key is provided. */
  const gqlCodegenKeyHeader = req.headers[`gql-codegen-key`];

  if (typeof gqlCodegenKeyHeader === `string`) {
    const getKey = () => {
      try {
        /* This config setting will only be set in local development and testing. */
        return config.get<string>(`gqlCodegenKey`);
      } catch {
        /* istanbul ignore next: testing will never hit this */
        return undefined;
      }
    };

    const gqlCodeGenKey = getKey();

    if (gqlCodeGenKey && gqlCodegenKeyHeader === gqlCodeGenKey) {
      /* Just an in-memory user object is enough for GraphQL introspection. */
      return getApiServerContext({
        requestHeaders,
        cookies,
        res,
        authUser: {
          id: 1,
          email: `gqlCodegen@sample-mono-stack.dev`,
          name: `gqlCodegen`,
          username: `gqlCodegen`,
          password: `gqlCodegen`,
        },
      });
    }
  }

  /* A user has not been authenticated. Throw an error instead of proceeding to a resolver. */
  throw new GraphQLError(`notAllowed`, {
    extensions: {
      http: { status: 200 },
    },
  });
};

/**
 * A specific route to authenticate a user.
 */
const authRoute = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  const cookies = req.cookies as RequestCookies;

  const user = await authenticateUser({ username, password });

  if (!user) {
    res.status(401).send(`Unauthorized`);
    return;
  }

  const session = await getSession({ cookies });

  if (!session) {
    const sessionId = await setSession({ user });

    if (!sessionId) {
      res.status(401).send(`Unauthorized`);
      return;
    }

    /* Set the cookie. */
    res.cookie(apiCookieName, sessionId, {
      secure: true,
      httpOnly: true,
      sameSite: `none`,
      path: `/`,
    });
  }

  res.status(200).send({ ok: true });
};

/**
 * Log all Apollo errors.
 */
// type LogApolloErrorArgs = {
//   error: GraphQLError;
//   context?: ApiServerContext;
// };

// const logApolloError = async ({ error, context }: LogApolloErrorArgs) => {
//   await new LogApolloErrorModel({
//     id: nanoid(32),
//     hostname: os.hostname(),
//     name: error.originalError?.name,
//     message: error.message,
//     nodes: JSON.stringify(error.nodes),
//     source: JSON.stringify(error.source),
//     positions: JSON.stringify(error.positions),
//     path: JSON.stringify(error.path),
//     stack: error.originalError?.stack,
//     stacktrace: error.extensions.stacktrace as string,
//     extras: JSON.stringify({
//       user: context?.user.id,
//       website: context?.website?.id,
//       userAgent: context?.requestHeaders[`user-agent`],
//     }),
//   }).save();
// };

const app = express();

/* Enable verbose errors inside Dev. */
/* istanbul ignore if: testing will never hit this */
if (process.env.NODE_ENV === `development`) {
  app.enable(`verbose errors`);
}

/**
 * Capture errors occurring from auth
 */
const handleAuthErrors = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  /* istanbul ignore if: testing will never hit this */
  if (process.env.NODE_ENV !== `production` && process.env.NODE_ENV !== `test`) {
    logger.error(err);
  }

  const errorMsg = `Something failed!`;

  if (req.xhr) {
    res.status(500).send({ error: errorMsg });
  } else {
    res.status(500).send(errorMsg);
  }
};

app.set(`trust proxy`, 1);
app.disable(`x-powered-by`);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: `50mb` }));
app.use(express.urlencoded({ limit: `50mb`, extended: true }));

app.post(`/auth`, asyncRoute(authRoute));
app.use(handleAuthErrors);

// const errorPlugin: ApolloServerPlugin = {
//   // eslint-disable-next-line @typescript-eslint/require-await
//   async requestDidStart() {
//     return {
//       didEncounterErrors({ errors, contextValue }) {
//         if (errors.length > 0) {
//           for (const error of errors) {
//             // await logApolloError({ error, context });
//           }
//         }

//         return Promise.resolve();
//       },
//     };
//   },
// };

const apolloServer = async () => {
  const plugins = [
    ApolloServerPluginCacheControl({
      defaultMaxAge: 1000,
      calculateHttpHeaders: false,
    }),
    /* Handle logging errors during the request. */
    // errorPlugin,
  ];

  /* Disable the Apollo landing page for all environments that are not dev. */
  /* istanbul ignore else : testing will never hit this */
  if (process.env.NODE_ENV !== `development`) {
    plugins.push(ApolloServerPluginLandingPageDisabled());
  } else {
    plugins.push(ApolloServerPluginLandingPageGraphQLPlayground({}));
  }

  const server = new ApolloServer({
    schema,
    plugins,
    formatError: formatApolloError,
  });

  await server.start();

  app.use(
    `/`,
    cors(corsOptions),
    express.json({ limit: `2mb` }),
    expressMiddleware(server, { context: setupContext }),
  );
};

void apolloServer();

export { app };
