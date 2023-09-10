import { render, screen } from '../../../testing/testingLibrary';
import { FormError, type FormErrorProps } from '../FormError';
import { getErrorMap } from '../errorMap';

type RenderComponentOptions = {
  /** The same props used for the FormError component. */
  props: FormErrorProps;

  /** Pass along the options that react-testing-library takes info for 'render'. */
  options?: { container: HTMLElement; baseElement?: HTMLElement };
};

const allErrors = getErrorMap() as Record<string, string>;

const renderComponent = ({ props, options }: RenderComponentOptions) => {
  return render(<FormError error={props.error} />, options);
};

test(`All error messages as strings`, async () => {
  const errorKeys = Object.keys(allErrors);

  for await (const errorKey of errorKeys) {
    renderComponent({
      props: {
        error: errorKey,
      },
    });

    await screen.findByText(allErrors[errorKey]);
  }
});

test(`FieldError with message`, async () => {
  const errorKey = `unauthorized`;

  renderComponent({
    props: {
      error: {
        type: `string`,
        message: errorKey,
      },
    },
  });

  await screen.findByText(allErrors[errorKey]);
});

test(`FieldError without message`, async () => {
  const errorKey = `formError`;

  renderComponent({
    props: {
      error: {
        type: `string`,
      },
    },
  });

  await screen.findByText(allErrors[errorKey]);
});

test(`Unknown error key`, async () => {
  const errorKey = `randomErrorKey`;

  renderComponent({
    props: {
      error: {
        type: `string`,
        message: errorKey,
      },
    },
  });

  await screen.findByText(errorKey);
});
