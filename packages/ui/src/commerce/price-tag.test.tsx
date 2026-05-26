import { render, screen } from '@testing-library/react';

import { PriceTag } from './price-tag';

describe('<PriceTag />', () => {
  it('renders only the current price by default', () => {
    render(<PriceTag price={{ amount: 19.99, currency: 'USD' }} />);
    expect(screen.getByText(/\$19\.99/)).toBeInTheDocument();
  });

  it('shows a strikethrough compare-at price and computed discount', () => {
    const { container } = render(
      <PriceTag price={{ amount: 80, compareAtAmount: 100, currency: 'USD' }} />,
    );
    expect(container.textContent).toContain('$80.00');
    expect(container.textContent).toContain('$100.00');
    expect(container.textContent).toContain('20%');
  });

  it('respects an explicit discountPercent on the price object', () => {
    const { container } = render(
      <PriceTag price={{ amount: 80, compareAtAmount: 100, currency: 'USD', discountPercent: 25 }} />,
    );
    expect(container.textContent).toContain('25%');
  });
});
