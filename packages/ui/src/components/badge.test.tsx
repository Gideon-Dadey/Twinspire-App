import { render, screen } from '@testing-library/react';

import { Badge } from './badge';

describe('<Badge />', () => {
  it('renders content', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active').className).toMatch(/bg-success/);
  });
});
