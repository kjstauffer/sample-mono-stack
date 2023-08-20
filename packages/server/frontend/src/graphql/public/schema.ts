import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';

/**
 * Take in all the scattered schemas and merge them in to one & apply the privileges middleware.
 */

import { privileges } from '../../privileges/map.js';

import { userTypeDefs, userResolvers } from './User/index.js';

const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: mergeTypeDefs([userTypeDefs]),
    resolvers: mergeResolvers([userResolvers]),
  }),
  /* Add privilege middleware to assert privileges before any resolver is called. */
  privileges,
);

export { schema };
