/* eslint-disable @typescript-eslint/naming-convention */
import { shield, deny } from 'graphql-shield';

import * as rules from './rules.js';

/**
 * A mapping of resolvers to rules based on GraphQL types.
 * The key is the name of the resolver function.
 * The value is a rule function. If it returns `true`, the resolver will execute.
 *
 * For more information, see https://github.com/maticzav/graphql-shield
 */
export const privileges = shield(
  {
    Query: {
      /* Deny all resolvers that are not explicitly listed here. */
      '*': deny,
      // getAuthenticatedUser: allow,
      getAuthenticatedUser: rules.canUse,
    },
    // Mutation: {
    //   /* Deny all resolvers that are not explicitly listed here. */
    //   '*': deny,
    // },
  },
  {
    /* Errors thrown in resolvers can be tracked using debug option. */
    // debug: true,

    /* An error to use when no other error is provided. */
    fallbackError: `unauthorized`,

    /* Prevent `graphql-shield` from hiding our custom errors. */
    allowExternalErrors: true,
  },
);
