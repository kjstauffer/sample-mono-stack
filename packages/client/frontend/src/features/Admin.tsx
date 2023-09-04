import React from 'react';

import { useAppContext } from '../AppContext';

const Admin = () => {
  const { user } = useAppContext();

  return (
    <div>
      <h3>Authenticated</h3>
      <p>Welcome {user?.name}</p>
    </div>
  );
};

export { Admin };
