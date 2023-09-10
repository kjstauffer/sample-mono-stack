import config from 'config';

import { GetAuthenticatedUserDocument, type User } from '../graphql/generatedComponents';

import { gqlErrorMock } from './apollo';

/**
 * Returns a mock `User` object.
 */
const getMockUser = (user?: Partial<User>): User => {
  const mockUser: User = {
    id: `1`,
    name: `user@${config.get<string>(`domain`)}`,
    __typename: `User`,
  };

  return {
    ...mockUser,
    ...user,
  };
};

/**
 * Returns a mock to fetch the authenticated user.
 */
const getAuthenticatedUserMock = (user: User) => {
  return {
    request: {
      query: GetAuthenticatedUserDocument,
      variables: {},
    },
    result: {
      data: {
        getAuthenticatedUser: {
          __typename: `GetAuthenticatedUserPayload`,
          user: getMockUser(user),
        },
      },
    },
  };
};

/**
 * Returns a mock for when there is no authenticated user.
 */
const getUnauthenticatedUserMock = () => {
  return gqlErrorMock(GetAuthenticatedUserDocument, {}, `notAllowed`)[0];
};

/**
 * Mock 'fetch' to intercept the call and return data for testing.
 */
type MockFetchOptions<T> = {
  data: T;
  ok?: boolean;
  reject?: boolean;
  rejectJson?: boolean;
};
export const mockFetch = <T>({ data, ok = true, reject, rejectJson }: MockFetchOptions<T>) =>
  jest.fn().mockImplementation(() => {
    if (reject) {
      return Promise.reject({
        ok: false,
        json: () => (rejectJson ? Promise.reject(data) : Promise.resolve(data)),
      });
    }

    return Promise.resolve({
      ok,
      json: () => (rejectJson ? Promise.reject(data) : Promise.resolve(data)),
    });
  });

export { getAuthenticatedUserMock, getUnauthenticatedUserMock, getMockUser };
