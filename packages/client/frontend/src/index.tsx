/* istanbul ignore file: This file is only loadable in the browser and can't be tested. */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { enableMapSet, enablePatches } from 'immer';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

import 'typeface-open-sans';

import { App } from './App';
import { RootErrorBoundary } from './RootErrorBoundary';
import { apolloApiClient } from './apollo/apiClient';
import { BaselineStyle } from './StyleWrapper';

export const muiCache = createCache({
  key: `mui`,
  prepend: true,
});

/* Grab a new instance of the Apollo client. */
const apolloClient = apolloApiClient();

/* Enable immer Map/Set support as well as JSON patches. */
enableMapSet();
enablePatches();

const container = document.getElementById(`fa-feature-root`);

if (container) {
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ApolloProvider client={apolloClient}>
            <BrowserRouter>
              <CacheProvider value={muiCache}>
                <BaselineStyle>
                  <App />
                </BaselineStyle>
              </CacheProvider>
            </BrowserRouter>
          </ApolloProvider>
        </React.Suspense>
      </RootErrorBoundary>
    </React.StrictMode>,
  );
}
