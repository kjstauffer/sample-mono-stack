import React from 'react';

import { StyleWrapper } from './StyleWrapper';
import { Auth } from './features/Auth';
import { useGetAuthenticatedUserQuery, type User } from './graphql/generatedComponents';
import { onError } from './apollo/errorHandling';
import { AppContextProvider } from './AppContext';
import { Admin } from './features/Admin';

type AdminAppProps = {
  user: User;
};
const AdminApp = ({ user }: AdminAppProps) => {
  return (
    <AppContextProvider user={user}>
      <Admin />
    </AppContextProvider>
  );
};

const App = () => {
  const { data: userData } = useGetAuthenticatedUserQuery({
    fetchPolicy: `network-only`,
    onError,
  });

  const user = userData?.getAuthenticatedUser.user;

  return (
    <StyleWrapper>
      Sample Mono Stack!
      {user ? <AdminApp user={user} /> : <Auth />}
    </StyleWrapper>
  );
};

export { App };
