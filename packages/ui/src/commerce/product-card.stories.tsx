import type { Meta, StoryObj } from '@storybook/react';

import { ProductCard, type ProductCardProduct } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';

const sample: ProductCardProduct = {
  id: 'sb-1',
  name: 'Aurora X Pro Wireless Headphones',
  slug: 'aurora-x-pro',
  sku: 'AU-XP-001',
  brandName: 'Aurora Audio',
  images: [
    {
      url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=70',
      alt: 'Headphones',
      position: 0,
    },
  ],
  price: { amount: 249, compareAtAmount: 349, currency: 'USD' },
  rating: {
    average: 4.8,
    count: 1284,
    distribution: { '1': 5, '2': 8, '3': 24, '4': 312, '5': 935 },
  },
  stockStatus: 'in_stock',
  isNewArrival: true,
  isBestSeller: true,
  tags: ['audio', 'noise-cancelling'],
};

const meta: Meta<typeof ProductCard> = {
  title: 'Commerce/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: { product: sample },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <ProductCard {...args} />
    </div>
  ),
};

export const OutOfStock: Story = {
  args: { product: { ...sample, stockStatus: 'out_of_stock' } },
  render: (args) => (
    <div className="w-72">
      <ProductCard {...args} />
    </div>
  ),
};

export const InWishlist: Story = {
  args: { inWishlist: true },
  render: (args) => (
    <div className="w-72">
      <ProductCard {...args} />
    </div>
  ),
};

export const Skeleton: Story = {
  render: () => (
    <div className="w-72">
      <ProductCardSkeleton />
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid w-[920px] grid-cols-3 gap-4">
      <ProductCard product={sample} />
      <ProductCard product={{ ...sample, id: '2', name: 'Nimbus 14 Laptop', stockStatus: 'low_stock', isBestSeller: false }} />
      <ProductCard product={{ ...sample, id: '3', name: 'Orbit Smart Ring', stockStatus: 'preorder', isNewArrival: false, price: { amount: 179, currency: 'USD' } }} />
    </div>
  ),
};
