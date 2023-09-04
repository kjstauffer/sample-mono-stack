import { InMemoryCache } from '@apollo/client';

export const getCache = () =>
  new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {},
      },
    },
  });

export const cache = getCache();
