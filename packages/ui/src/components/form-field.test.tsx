import { render, screen } from '@testing-library/react';

import { FormField } from './form-field';
import { Input } from './input';

describe('<FormField />', () => {
  it('associates the label with the input via id', () => {
    render(
      <FormField id="email" label="Email" required>
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('id', 'email');
  });

  it('renders the description and wires aria-describedby', () => {
    render(
      <FormField id="email" label="Email" description="We never share your email">
        <Input type="email" />
      </FormField>,
    );
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('email-description'));
    expect(screen.getByText(/never share/i)).toBeInTheDocument();
  });

  it('renders an alert message when there is an error and marks the field invalid', () => {
    render(
      <FormField id="email" label="Email" error="Required">
        <Input type="email" />
      </FormField>,
    );
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(/required/i);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
