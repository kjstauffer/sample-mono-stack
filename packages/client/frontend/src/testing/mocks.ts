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
// export const mockFetch = (data: ApiResponse, reject?: boolean) =>
//   jest.fn().mockImplementation(() => {
//     if (reject) {
//       return Promise.reject(`Reject`);
//     }

//     return Promise.resolve({
//       ok: true,
//       json: () => Promise.resolve(data),
//     });
//   });

export { getAuthenticatedUserMock, getUnauthenticatedUserMock, getMockUser };
