import { render } from '@testing-library/react';

import { Money } from './money';

describe('<Money />', () => {
  it('formats a USD money object', () => {
    const { container } = render(<Money value={{ amount: 19.99, currency: 'USD' }} />);
    expect(container.textContent).toMatch(/\$19\.99/);
  });

  it('renders nothing when no value is provided', () => {
    const { container } = render(<Money />);
    expect(container.firstChild).toBeNull();
  });

  it('applies strikethrough class when requested', () => {
    const { container } = render(
      <Money value={{ amount: 12, currency: 'EUR' }} strikethrough />,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/line-through/);
  });
});
