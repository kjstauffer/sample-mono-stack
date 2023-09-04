import React from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';

import { useHookFormSubmitHandler } from '../ui/form/hooks';

type FormValues = {
  username: string;
  password: string;
};

const AuthForm = () => {
  const usernameInputId = React.useId();
  const passwordInputId = React.useId();
  const { register } = useFormContext();

  const onSubmit = React.useCallback((_values: FormValues, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();

    /**
     * @todo - authenticate
     * For now, just force authentication.
     */
  }, []);

  const submitHandler = useHookFormSubmitHandler<FormValues>(onSubmit);

  return (
    <form onSubmit={submitHandler}>
      <div>
        <label htmlFor={usernameInputId}>Username:</label>
        <input id={usernameInputId} type="text" {...register(`username`)} />
      </div>
      <div>
        <label htmlFor={passwordInputId}>Password:</label>
        <input id={passwordInputId} type="password" {...register(`password`)} />
      </div>
      <div>
        <input type="submit" value="Sign In" />
      </div>
    </form>
  );
};

const Auth = () => {
  const rhf = useForm({
    defaultValues: {
      username: ``,
      password: ``,
    },
  });

  return (
    <FormProvider {...rhf}>
      <AuthForm />
    </FormProvider>
  );
};

export { Auth };
