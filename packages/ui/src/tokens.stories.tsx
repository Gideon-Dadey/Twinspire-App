import type { Meta, StoryObj } from '@storybook/react';

import { palette, radii, shadows, spacing, typography } from './tokens';

const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

function ColorRamp({ name, ramp }: { name: string; ramp: Record<string, string> }) {
  return (
    <section className="space-y-2">
      <h3 className="font-display text-sm font-semibold tracking-tight">{name}</h3>
      <div className="flex flex-wrap gap-1">
        {Object.entries(ramp).map(([shade, value]) => (
          <div
            key={shade}
            className="flex w-24 flex-col gap-1 rounded-lg border border-border p-2 text-[10px]"
          >
            <span className="block h-10 rounded" style={{ background: value }} />
            <span className="font-medium text-foreground">{shade}</span>
            <span className="text-muted-foreground">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export const Palette: Story = {
  render: () => (
    <div className="space-y-6">
      <ColorRamp name="Primary (TwinSpire Blue)" ramp={palette.primary} />
      <ColorRamp name="Secondary (Onyx)" ramp={palette.secondary} />
      <ColorRamp name="Accent (Voltage Orange)" ramp={palette.accent} />
      <ColorRamp name="Neutral" ramp={palette.neutral} />
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold tracking-tight">Type scale</h3>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="py-2">Token</th>
            <th className="py-2">Preview</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(typography.fontSize).map((key) => (
            <tr key={key} className="border-t border-border">
              <td className="py-2 font-mono text-xs text-muted-foreground">{key}</td>
              <td className={`py-2 text-${key}`}>The quick brown fox jumps over the lazy dog</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-tight">Spacing scale</h3>
      <div className="space-y-1">
        {Object.entries(spacing).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="w-12 font-mono text-xs text-muted-foreground">{key}</span>
            <span className="font-mono text-xs text-muted-foreground">{value}</span>
            <span className="h-2 rounded bg-primary" style={{ width: value }} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Radii: Story = {
  render: () => (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-tight">Border radius</h3>
      <div className="flex flex-wrap gap-3">
        {Object.entries(radii).map(([key, value]) => (
          <div
            key={key}
            className="flex h-20 w-28 flex-col items-center justify-center gap-1 border border-border bg-card text-xs"
            style={{ borderRadius: value }}
          >
            <span className="font-mono text-muted-foreground">{key}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold tracking-tight">Elevation</h3>
      <div className="flex flex-wrap gap-6 bg-muted/40 p-6">
        {Object.entries(shadows).map(([key, value]) => (
          <div
            key={key}
            className="flex h-24 w-32 flex-col items-center justify-center gap-1 rounded-lg bg-background text-xs"
            style={{ boxShadow: value }}
          >
            <span className="font-mono text-muted-foreground">{key}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
