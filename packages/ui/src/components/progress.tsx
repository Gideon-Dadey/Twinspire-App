'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(function Progress({ className, value, indicatorClassName, ...props }, ref) {
  const safe = Math.max(0, Math.min(100, value ?? 0));
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={safe}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full w-full flex-1 bg-primary transition-transform', indicatorClassName)}
        style={{ transform: `translateX(-${100 - safe}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
