import React from 'react';

import type { User } from '../../graphql/generatedComponents';
import { apiPost } from '../api';

type SignInResponse = {
  user: User;
};

type SignInVariables = {
  username: string;
  password: string;
};

/**
 * Attempt to authenticate a user.
 */
const useSignIn = () => {
  const [user, setUser] = React.useState<User>();
  const [error, setError] = React.useState<string>();

  const doSignIn = React.useCallback(async (variables: SignInVariables) => {
    const res = await apiPost<SignInResponse>(`/auth`, {
      ...variables,
    });

    if (res.ok && res.data) {
      setUser(res.data.user);
    } else {
      setUser(undefined);

      /* istanbul ignore else: testing won't hit the else */
      if (res.error) {
        setError(`invalidCredentials`);
      }
    }
  }, []);

  return {
    doSignIn,
    user,
    error,
  };
};

export { useSignIn };
