import type { GraphQLFormattedError } from 'graphql';

export const formatApolloError = (err: GraphQLFormattedError): GraphQLFormattedError => {
  return err;
};
