import type { Meta, StoryObj } from '@storybook/react';

import { QuantityStepper } from './quantity-stepper';

const meta: Meta<typeof QuantityStepper> = {
  title: 'Commerce/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { defaultValue: 1, min: 0, max: 10 },
};

export default meta;
type Story = StoryObj<typeof QuantityStepper>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <QuantityStepper size="sm" defaultValue={1} />
      <QuantityStepper size="md" defaultValue={1} />
      <QuantityStepper size="lg" defaultValue={1} />
    </div>
  ),
};
