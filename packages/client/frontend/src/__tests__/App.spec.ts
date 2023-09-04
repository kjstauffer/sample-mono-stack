import { screen, userEvent } from '../testing/testingLibrary';
import {
  renderUnauthenticatedRoute,
  renderAuthenticatedRoute,
  renderException,
} from '../testing/routes';

const route = URL_PATHS.admin.root;

afterEach(() => {
  jest.restoreAllMocks();
});

describe(`Error tests`, () => {
  test(`Unhandled exception`, async () => {
    /**
     * `renderException` will throw during render and spit out a bunch of noise to console.
     * The following will prevent all that noise from being logged to console.
     */
    jest.spyOn(console, `error`).mockImplementation(() => null);

    renderException();

    /* Assert `RootErrorBoundary` component renders when the exception is thrown. */
    await screen.findByText(`Unexpected Error`);
  });

  test(`Unauthenticated user`, async () => {
    renderUnauthenticatedRoute({ route });

    await screen.findByLabelText(`Username:`);
    await screen.findByLabelText(`Password:`);
  });
});

describe(`Success tests`, () => {
  test(`Authenticated user`, async () => {
    renderAuthenticatedRoute({ route, user: { name: `sampleUser ` } });

    await screen.findByText(`Sample Mono Stack!`);
    await screen.findByText(`Authenticated`);
    await screen.findByText(`Welcome sampleUser`);

    expect(screen.queryByLabelText(`Username:`)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(`Password:`)).not.toBeInTheDocument();
  });

  test(`Authenticate user`, async () => {
    renderUnauthenticatedRoute({ route });

    await userEvent.type(await screen.findByLabelText(`Username:`), `sampleUsername`);
    await userEvent.type(await screen.findByLabelText(`Password:`), `samplePassword`);

    await userEvent.click(await screen.findByText(`Sign In`));
  });
});
