import React from 'react';
import { useFormContext, type FieldValues, type SubmitHandler } from 'react-hook-form';

/**
 * A hook that wraps ReactHookForm's `handleSubmit` to prevent the browser's default
 * form submission (i.e. prevent page reload on submission). This is necessary when
 * type-casting ReactHookForm's `handleSubmit` return value to `void`.
 */
const useHookFormSubmitHandler = <FormValues extends FieldValues>(
  onSubmit: SubmitHandler<FormValues>,
) => {
  const { handleSubmit } = useFormContext<FormValues>();

  return (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    void handleSubmit(onSubmit)(e);
  };
};

export { useHookFormSubmitHandler };
