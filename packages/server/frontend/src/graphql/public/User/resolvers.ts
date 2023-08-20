import type { Resolvers } from '../generatedTypes.js';

const resolvers: Resolvers = {
  Query: {
    /**
     * Return a User object for the signed-in user.
     */
    getAuthenticatedUser(_, _args, ctx) {
      const { authUser } = ctx;

      return {
        user: {
          id: `${authUser.id}`,
          name: authUser.name ?? ``,
        },
      };
    },
  },
  // Mutation: {
  // },
};

export { resolvers };
