import type { ReactNode } from 'react';

/**
 * CONFIG namespace for pulling config variables into the React code.
 * Interfaces should be created within the namespace for any nested objects.
 * When necessary, use 'let' instead of 'const', so we can alter the values for tests.
 */
declare global {
  namespace CONFIG {
    const domain: string;

    const api: {
      public: {
        hostname: string;
      };
    };
  }

  /**
   * `children` is best defined as `React.ReactNode`. This covers all possibilities.
   * @see https://github.com/typescript-cheatsheets/react-typescript-cheatsheet#useful-react-prop-type-examples
   */
  type ChildrenProps = {
    children: ReactNode;
  };
}
