import { render, screen } from '@testing-library/react';

import { RatingStars } from './rating-stars';

describe('<RatingStars />', () => {
  it('renders the configured value with an aria label', () => {
    render(<RatingStars value={4.5} count={120} />);
    expect(screen.getByRole('img', { name: /4\.5/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /120/i })).toBeInTheDocument();
  });

  it('clamps values outside [0, max]', () => {
    render(<RatingStars value={7} max={5} />);
    expect(screen.getByRole('img', { name: /5\.0 of 5/i })).toBeInTheDocument();
  });

  it('shows the numeric value when showValue is on', () => {
    render(<RatingStars value={3.2} showValue showCount={false} />);
    expect(screen.getByText('3.2')).toBeInTheDocument();
  });
});
