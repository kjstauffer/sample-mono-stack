const getErrorMap = (): Record<string, string | undefined> => {
  return {
    unauthorized: `Unauthorized`,
    invalidCredentials: `Invalid Credentials`,
    formError: `Invalid form data`,
    usernameMinLengthError: `Username must be at least 4 characters.`,
    usernameMaxLengthError: `Username cannot be larger than 100 characters.`,
    passwordMinLengthError: `Password must be at least 4 characters.`,
  };
};

export { getErrorMap };
