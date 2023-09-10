import React from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useHookFormSubmitHandler } from '../ui/form/hooks';
import { useSignIn } from '../utils/api/useSignIn';
import { useAppContext } from '../AppContext';
import { FormError } from '../ui/form/FormError';

const validationSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type FormValues = z.infer<typeof validationSchema>;

const AuthForm = () => {
  const usernameInputId = React.useId();
  const passwordInputId = React.useId();
  const {
    register,
    /* Uncomment to add form field errors if necessary. */
    // formState: { errors },
  } = useFormContext<FormValues>();
  const { dispatch } = useAppContext();
  const { user, error, doSignIn } = useSignIn();

  /* Authenticate */
  const onSubmit = async (values: FormValues) => {
    await doSignIn({ ...values });
  };

  /* If authenticated, update context with authenticated User */
  React.useEffect(() => {
    if (user) {
      dispatch({ type: `SET_AUTHENTICATED_USER`, user });
    }
  }, [dispatch, user]);

  const submitHandler = useHookFormSubmitHandler<FormValues>(onSubmit);

  return (
    <>
      {error && <FormError error={error} />}
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
    </>
  );
};

const Auth = () => {
  const rhf = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
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
