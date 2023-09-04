/* istanbul ignore file: Apollo is all mocked in testing. */

import { ApolloClient, ApolloLink, HttpLink } from '@apollo/client';
// import { onError } from '@apollo/client/link/error';

import { cache } from './apiClientCache';

// const errorLink = () =>
//   onError(({ graphQLErrors }) => {
//     /* Trigger an `onReauth` event for authentication errors. */
//     if (graphQLErrors?.length) {
//       if (
//         graphQLErrors[0].message === `authenticationError` &&
//         window.location.pathname !== `/login`
//       ) {
//         document.dispatchEvent(new CustomEvent(`onReauth`));
//       }
//     }
//   });

const apiUrl = (): string => {
  return `https://${CONFIG.api.public.hostname}.${CONFIG.domain}`;
};

const httpLink = (): HttpLink => {
  return new HttpLink({
    uri: apiUrl(),
    credentials: `include`,
  });
};

/**
 * Setup an Apollo Client to be used for public routes.
 */
const apolloApiClient = () =>
  new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === `development`,
    link: ApolloLink.from([
      // errorLink(),
      httpLink(),
    ]),
    cache,
  });

export { apolloApiClient, apiUrl };
