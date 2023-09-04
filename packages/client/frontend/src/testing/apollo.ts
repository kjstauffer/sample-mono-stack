import type { MockedResponse } from '@apollo/client/testing';
import { GraphQLError, type DocumentNode } from 'graphql';

/**
 * A helper to return a single mock for testing the response to a graphql error.
 * @param query The GraphQL query itself.
 * @param variables The variables to pass into the query.
 * @param error The error string to return.
 */
const gqlErrorMock = <T extends Record<string, unknown> | undefined>(
  query: DocumentNode,
  variables: T,
  error: string,
): MockedResponse[] => [
  {
    request: {
      query,
      variables,
    },
    result: {
      errors: [new GraphQLError(error, {})],
    },
  },
];

export { gqlErrorMock };
