import React from 'react';
import type { Draft } from 'immer';
import { useImmerReducer } from 'use-immer';

import { onError } from './apollo/errorHandling';
import { useGetAuthenticatedUserQuery, type User } from './graphql/generatedComponents';

/**
 * A context that wraps the entire application to provide application-wide state.
 * Useful for tracking an authenticated user and providing that user data downstream.
 */

type State = {
  /** The authenticated user */
  user?: User;

  /** `true` if the application finished loading */
  didFinishLoading: boolean;

  /** Contains an error message if authentication failed. */
  error?: string;
};

/**
 * All the actions that can be dispatched throughout the app to update state.
 */
type Action =
  | { type: `SET_AUTHENTICATED_USER`; user: State[`user`] }
  | { type: `SET_AUTHENTICATION_ERROR`; error: State[`error`] };

const reducer = (draft: Draft<State>, action: Action) => {
  switch (action.type) {
    case `SET_AUTHENTICATED_USER`:
      draft.user = action.user;
      draft.didFinishLoading = true;
      break;

    case `SET_AUTHENTICATION_ERROR`:
      draft.error = action.error;
      draft.didFinishLoading = true;
      break;

    /* no default */
  }
};

type Context = State & {
  isLoading: boolean;
  dispatch: React.Dispatch<Action>;
};

const AppContext = React.createContext({} as Context);

const AppContextProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useImmerReducer(reducer, {
    user: undefined,
  } as State);

  /**
   * Check if a user already has already been authenticated and has a session.
   * If so, automatically set the user as authenticated.
   */
  const { loading: isLoading } = useGetAuthenticatedUserQuery({
    fetchPolicy: `network-only`,
    onError(error) {
      onError(error);
      dispatch({ type: `SET_AUTHENTICATION_ERROR`, error: error.message });
    },
    onCompleted(data) {
      dispatch({ type: `SET_AUTHENTICATED_USER`, user: data.getAuthenticatedUser.user });
    },
  });

  const context = React.useMemo(
    () => ({
      ...state,
      isLoading,
      dispatch,
    }),
    [dispatch, isLoading, state],
  );

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

/**
 * A convenience hook for quick access to the app context.
 */
const useAppContext = () => React.useContext(AppContext);

export { AppContextProvider, useAppContext };
