import type { ApolloError } from '@apollo/client';

/**
 * An error handler to centralize some common actions related to errors from any query.
 * Currently only used to catch mis-matched mocks in tests. So, it is ignored in code coverage.
 */
/* istanbul ignore next */
const onError = (error: ApolloError) => {
  if (process.env.NODE_ENV === `test`) {
    if (error.message.includes(`No more mocked responses`)) {
      console.error(error);
    }
  }
};

export { onError };
