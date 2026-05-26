import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Search } from 'lucide-react';

import { FormField } from './form-field';

import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Search…' },
};

export const WithLeftIcon: Story = {
  render: () => <Input placeholder="Search…" leftAddon={<Search className="size-4" aria-hidden />} />,
};

export const Invalid: Story = {
  args: { placeholder: 'Invalid email', invalid: true, defaultValue: 'not-an-email' },
};

export const WithFormField: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <FormField id="email" label="Email" required description="We never share your email">
        <Input type="email" placeholder="hello@twinspire.dev" leftAddon={<Mail className="size-4" aria-hidden />} />
      </FormField>
      <FormField id="email2" label="Email" error="That email already exists">
        <Input type="email" defaultValue="taken@twinspire.dev" />
      </FormField>
    </div>
  ),
};
