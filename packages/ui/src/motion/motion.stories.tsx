import type { Meta, StoryObj } from '@storybook/react';

import { Card } from '../components/card';
import { FadeIn } from './fade-in';
import { Reveal } from './reveal';
import { Stagger, StaggerItem } from './stagger';

const meta: Meta = {
  title: 'Motion/Presets',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const FadeInBlock: Story = {
  render: () => (
    <FadeIn>
      <Card className="p-6">
        <p>This card fades in on mount.</p>
      </Card>
    </FadeIn>
  ),
};

export const ScrollReveal: Story = {
  render: () => (
    <div className="space-y-32">
      <p className="text-sm text-muted-foreground">Scroll down to trigger the reveal.</p>
      <div className="h-[60vh]" />
      <Reveal>
        <Card className="p-6">
          <p>This card slides up the first time it enters the viewport.</p>
        </Card>
      </Reveal>
      <div className="h-[60vh]" />
      <Reveal>
        <Card className="p-6">
          <p>Another reveal further down.</p>
        </Card>
      </Reveal>
      <div className="h-[60vh]" />
    </div>
  ),
};

export const StaggeredList: Story = {
  render: () => (
    <Stagger className="grid grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <StaggerItem key={idx}>
          <Card className="p-6 text-center">Item {idx + 1}</Card>
        </StaggerItem>
      ))}
    </Stagger>
  ),
};
