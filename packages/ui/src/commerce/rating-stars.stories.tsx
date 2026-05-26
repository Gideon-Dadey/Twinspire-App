import type { Meta, StoryObj } from '@storybook/react';

import { RatingStars } from './rating-stars';

const meta: Meta<typeof RatingStars> = {
  title: 'Commerce/RatingStars',
  component: RatingStars,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { value: 4.5, count: 1284 },
};

export default meta;
type Story = StoryObj<typeof RatingStars>;

export const Default: Story = {};

export const Empty: Story = { args: { value: 0, count: 0 } };

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <RatingStars value={4.3} count={12} size="xs" />
      <RatingStars value={4.3} count={12} size="sm" />
      <RatingStars value={4.3} count={12} size="md" showValue />
      <RatingStars value={4.3} count={12} size="lg" showValue />
    </div>
  ),
};
