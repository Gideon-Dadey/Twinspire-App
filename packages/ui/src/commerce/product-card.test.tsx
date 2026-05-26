import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ProductCardProduct } from './product-card';
import { ProductCard } from './product-card';

const baseProduct: ProductCardProduct = {
  id: 'prod-1',
  name: 'TwinSpire Wireless Headphones',
  slug: 'twinspire-headphones',
  sku: 'TS-WH-001',
  brandName: 'TwinSpire',
  images: [{ url: '/img.jpg', alt: 'Headphones', position: 0 }],
  price: { amount: 199, compareAtAmount: 249, currency: 'USD' },
  rating: { average: 4.5, count: 240, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } },
  stockStatus: 'in_stock',
  isNewArrival: true,
  isBestSeller: false,
  tags: [],
};

describe('<ProductCard />', () => {
  it('renders the brand, name, SKU, and a price tag', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText(baseProduct.name)).toBeInTheDocument();
    expect(screen.getByText('TwinSpire')).toBeInTheDocument();
    expect(screen.getByText(baseProduct.sku)).toBeInTheDocument();
    expect(screen.getByText(/\$199\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$249\.00/)).toBeInTheDocument();
  });

  it('uses /products/<slug> as the default detail link', () => {
    render(<ProductCard product={baseProduct} />);
    const link = screen.getByRole('link', { name: new RegExp(`view ${baseProduct.name}`, 'i') });
    expect(link).toHaveAttribute('href', `/products/${baseProduct.slug}`);
  });

  it('renders Out of stock state and disables the CTA', () => {
    render(<ProductCard product={{ ...baseProduct, stockStatus: 'out_of_stock' }} />);
    const cta = screen.getByRole('button', { name: /notify me/i });
    expect(cta).toBeDisabled();
  });

  it('emits onAddToCart when the CTA is clicked', async () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={baseProduct} onAddToCart={onAddToCart} />);
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledWith(baseProduct);
  });

  it('shows the wishlist toggle and announces its pressed state', async () => {
    const onAddToWishlist = jest.fn();
    render(<ProductCard product={baseProduct} onAddToWishlist={onAddToWishlist} inWishlist />);
    const wishlistBtn = screen.getByRole('button', { name: /remove from wishlist/i });
    expect(wishlistBtn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(wishlistBtn);
    expect(onAddToWishlist).toHaveBeenCalledWith(baseProduct);
  });
});
