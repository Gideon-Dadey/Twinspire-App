import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuantityStepper } from './quantity-stepper';

describe('<QuantityStepper />', () => {
  it('increments and decrements the value via the buttons', async () => {
    const onValueChange = jest.fn();
    render(<QuantityStepper defaultValue={1} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onValueChange).toHaveBeenLastCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('clamps to the configured min/max bounds', async () => {
    render(<QuantityStepper defaultValue={1} min={1} max={3} />);
    const dec = screen.getByRole('button', { name: /decrease/i });
    expect(dec).toBeDisabled();
    const inc = screen.getByRole('button', { name: /increase/i });
    await userEvent.click(inc);
    await userEvent.click(inc);
    expect(inc).toBeDisabled();
  });
});
