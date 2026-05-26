import type { Meta, StoryObj } from '@storybook/react';

import { PriceTag } from './price-tag';

const meta: Meta<typeof PriceTag> = {
  title: 'Commerce/PriceTag',
  component: PriceTag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof PriceTag>;

export const Default: Story = {
  args: { price: { amount: 199, currency: 'USD' } },
};

export const Sale: Story = {
  args: { price: { amount: 159, compareAtAmount: 199, currency: 'USD' } },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <PriceTag size="sm" price={{ amount: 19.99, compareAtAmount: 24.99, currency: 'USD' }} />
      <PriceTag size="md" price={{ amount: 19.99, compareAtAmount: 24.99, currency: 'USD' }} />
      <PriceTag size="lg" price={{ amount: 19.99, compareAtAmount: 24.99, currency: 'USD' }} />
      <PriceTag size="xl" price={{ amount: 19.99, compareAtAmount: 24.99, currency: 'USD' }} />
    </div>
  ),
};
