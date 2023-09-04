import React from 'react';
// import type { Draft } from 'immer';
// import { useImmerReducer } from 'use-immer';

import type { User } from './graphql/generatedComponents';

type State = {
  user?: User;
};

/**
 * All the actions that can be dispatched throughout the app to update state.
 */
// type Action = { type: `SET_AUTHENTICATED`; user: User };

/**
 * Uncomment when a reducer is needed to perform state updates.
 */
// const reducer = (_draft: Draft<State>, _action: Action) => {
// switch (action.type) {
//   case `SET_AUTHENTICATED`:
//     draft.user = action.user;
//     break;
// /* no default */
// }
// };

type Context = State & {
  /**
   * Uncomment when using a reducer in order to provide a dispatch function for state updates.
   */
  // dispatch: React.Dispatch<Action>;
};

const AppContext = React.createContext({} as Context);

type Props = {
  user?: User;
};

const AppContextProvider = ({ children, user }: React.PropsWithChildren<Props>) => {
  /**
   * Uncomment when a reducer is needed to perform state updates.
   */
  // const [state, dispatch] = useImmerReducer(reducer, {
  //   user,
  // } as State);

  const context = React.useMemo(
    () => ({
      user,
      // dispatch,
    }),
    [user],
  );

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

/**
 * A convenience hook for quick access to the app context.
 */
const useAppContext = () => React.useContext(AppContext);

export { AppContextProvider, useAppContext };
