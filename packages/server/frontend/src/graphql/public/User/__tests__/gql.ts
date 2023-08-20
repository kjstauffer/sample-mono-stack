export const getAuthenticatedUserQuery = /* GraphQL */ `
  query GetAuthenticatedUser {
    getAuthenticatedUser {
      user {
        id
        name
      }
    }
  }
`;
