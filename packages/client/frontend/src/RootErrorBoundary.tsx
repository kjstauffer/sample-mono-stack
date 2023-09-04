import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = () => (
  <div role="alert">
    <h3>Unexpected Error</h3>
    <p>An unexpected error has occurred. Please reload and try again.</p>
  </div>
);

/**
 * An ErrorBoundary to use at the root of the app which will catch any errors
 * not caught deeper in the component tree.
 */
const RootErrorBoundary = ({ children }: React.PropsWithChildren<unknown>) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
);

export { RootErrorBoundary };
