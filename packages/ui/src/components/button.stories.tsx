import type { Meta, StoryObj } from '@storybook/react';
import { Heart, ShoppingCart } from 'lucide-react';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'accent',
        'success',
      ],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', 'icon'] },
    rounded: { control: 'select', options: ['default', 'full', 'none'] },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Add to cart' },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="success">Success</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button leftIcon={<ShoppingCart aria-hidden />}>Add to cart</Button>
      <Button variant="outline" rightIcon={<Heart aria-hidden />}>
        Wishlist
      </Button>
      <Button size="icon" variant="ghost" aria-label="Like">
        <Heart aria-hidden />
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  args: { children: 'Saving…', loading: true },
};
