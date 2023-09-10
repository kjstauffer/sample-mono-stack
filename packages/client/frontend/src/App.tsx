import React from 'react';

import { StyleWrapper } from './StyleWrapper';
import { Auth } from './features/Auth';
import { useAppContext } from './AppContext';
import { Admin } from './features/Admin';

const AdminApp = () => {
  return <Admin />;
};

const App = () => {
  const { user, isLoading, didFinishLoading } = useAppContext();

  if (isLoading) {
    return `Loading...`;
  }

  return (
    <StyleWrapper>
      Sample Mono Stack!
      {user && <AdminApp />}
      {!user && didFinishLoading && <Auth />}
    </StyleWrapper>
  );
};

export { App };
