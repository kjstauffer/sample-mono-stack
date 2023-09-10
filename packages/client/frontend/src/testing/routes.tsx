import React from 'react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { getCache } from '../apollo/apiClientCache';
import type { User } from '../graphql/generatedComponents';
import { RootErrorBoundary } from '../RootErrorBoundary';
import { BaselineStyle } from '../StyleWrapper';
import { App } from '../App';
import { AppContextProvider } from '../AppContext';

import { setMatchMedia, type MediaWidth } from './media';
import { getAuthenticatedUserMock, getMockUser, getUnauthenticatedUserMock } from './mocks';

export type RenderRouteProps = {
  /** The route to load. */
  route: string;

  /** GraphQL mocks to pass into the MockedProvider. */
  gqlMocks?: MockedResponse[];

  /** Pass along the options that react-testing-library takes info for 'render'. */
  options?: { container: HTMLElement; baseElement?: HTMLElement };

  /** Mock media width. Defaults to `lg`. */
  mediaWidth?: MediaWidth;
};

export type RenderAuthenticateRouteProps = RenderRouteProps & {
  /** The authenticated User. */
  user?: Partial<User>;
};

const MockException = () => {
  throw new Error(`unhandledException`);
};

export const renderException = () => {
  return render(
    <RootErrorBoundary>
      <BaselineStyle>
        <MockException />
      </BaselineStyle>
    </RootErrorBoundary>,
  );
};

const renderRoute = ({ route, gqlMocks = [], options, mediaWidth = `lg` }: RenderRouteProps) => {
  const cache = getCache();
  const allGqlMocks = [...gqlMocks];

  setMatchMedia(mediaWidth);

  return render(
    <RootErrorBoundary>
      <React.Suspense fallback={<div>Loading...</div>}>
        <MockedProvider mocks={allGqlMocks} cache={cache}>
          <MemoryRouter initialEntries={[route]}>
            <BaselineStyle>
              <AppContextProvider>
                <App />
              </AppContextProvider>
            </BaselineStyle>
          </MemoryRouter>
        </MockedProvider>
      </React.Suspense>
    </RootErrorBoundary>,
    options,
  );
};

export const renderAuthenticatedRoute = ({
  user,
  gqlMocks = [],
  ...props
}: RenderAuthenticateRouteProps) => {
  const authenticatedUser = getMockUser(user);
  const allGqlMocks = [getAuthenticatedUserMock(authenticatedUser), ...gqlMocks];

  return renderRoute({
    ...props,
    gqlMocks: allGqlMocks,
  });
};

export const renderUnauthenticatedRoute = ({ gqlMocks = [], ...props }: RenderRouteProps) => {
  const allGqlMocks = [getUnauthenticatedUserMock(), ...gqlMocks];

  return renderRoute({
    ...props,
    gqlMocks: allGqlMocks,
  });
};
