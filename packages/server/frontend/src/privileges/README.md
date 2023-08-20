# Privileges

Privilege middleware is implemented using `graphql-shield`. Its purpose is to assert a user's privilege before any resolver function executes. To do this, a mapping file (`map.ts`) contains the names of each resolver mapped to one or more rules. A rule is just a function that returns true if the user has the appropriate privilege. All rules are stored in the `rules.ts` file. If the user does not have the proper privileges, the resolver will not be executed.

The current configuration is that all resolvers will be denied unless a mapping exists for it and the rule(s) assigned to it pass.

- See the `map.ts` file for information on how to map resolvers to rules.
- See the `rules.ts` file for information on how to create rules.

For information on `graphql-shield`, see:

- https://github.com/maticzav/graphql-shield
- https://medium.com/@maticzav/graphql-shield-9d1e02520e35
