'use client';

import { Minus, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '../components/button';
import { cn } from '../lib/cn';
import { useControllableState } from '../lib/hooks/use-controllable-state';

export interface QuantityStepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onValueChange?: (next: number) => void;
  'aria-label'?: string;
}

const sizes = {
  sm: { wrap: 'h-8 w-24 text-xs', button: 'h-8 w-8', input: 'h-8' },
  md: { wrap: 'h-10 w-28 text-sm', button: 'h-10 w-10', input: 'h-10' },
  lg: { wrap: 'h-12 w-36 text-base', button: 'h-12 w-12', input: 'h-12' },
} as const;

export function QuantityStepper({
  value,
  defaultValue = 1,
  min = 0,
  max = 99,
  step = 1,
  disabled,
  size = 'md',
  className,
  onValueChange,
  ...props
}: QuantityStepperProps): React.JSX.Element {
  const [current = defaultValue, setCurrent] = useControllableState<number>({
    prop: value,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const clamp = React.useCallback(
    (next: number) => Math.min(max, Math.max(min, next)),
    [min, max],
  );

  const dec = () => setCurrent((prev = defaultValue) => clamp(prev - step));
  const inc = () => setCurrent((prev = defaultValue) => clamp(prev + step));

  const styles = sizes[size];

  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-full border border-input bg-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background',
        disabled && 'opacity-50',
        styles.wrap,
        className,
      )}
      role="group"
      aria-label={props['aria-label'] ?? 'Quantity'}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        rounded="full"
        className={cn('shrink-0 rounded-none', styles.button)}
        onClick={dec}
        disabled={Boolean(disabled) || current <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" aria-hidden />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) setCurrent(clamp(next));
        }}
        className={cn(
          'w-full flex-1 border-x border-input bg-transparent text-center font-medium tabular-nums',
          'focus:outline-none disabled:cursor-not-allowed',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          styles.input,
        )}
        aria-label="Current quantity"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        rounded="full"
        className={cn('shrink-0 rounded-none', styles.button)}
        onClick={inc}
        disabled={Boolean(disabled) || current >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}
