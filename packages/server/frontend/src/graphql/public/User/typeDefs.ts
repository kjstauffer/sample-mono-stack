import { gql } from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
  }

  type GetAuthenticatedUserPayload {
    user: User!
  }

  type Query {
    getAuthenticatedUser: GetAuthenticatedUserPayload!
  }
`;

export { typeDefs };
