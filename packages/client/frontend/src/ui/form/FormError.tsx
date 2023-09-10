import React from 'react';
import styled from '@emotion/styled';
import type { FieldError } from 'react-hook-form';

import { getErrorMap } from './errorMap';

export type FormErrorProps = {
  error: FieldError | string;
};

const FormError = ({ error }: FormErrorProps) => {
  const errorMap = getErrorMap();

  const Error = styled.span`
    color: red;
  `;

  const errorKey = typeof error === `object` ? error.message ?? `formError` : error;

  return <Error>{errorMap[errorKey] ?? errorKey}</Error>;
};

export { FormError };
