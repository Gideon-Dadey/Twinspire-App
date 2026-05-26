import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './button';

describe('<Button />', () => {
  it('renders children as accessible text', () => {
    render(<Button>Buy now</Button>);
    expect(screen.getByRole('button', { name: 'Buy now' })).toBeInTheDocument();
  });

  it('shows a loading spinner and marks aria-busy when loading', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('does not fire onClick while disabled', async () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Hold
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Hold' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards refs to the underlying button', () => {
    const ref: { current: HTMLButtonElement | null } = { current: null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies variant + size classes', () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.className).toMatch(/bg-destructive/);
    expect(btn.className).toMatch(/h-11/);
  });
});
