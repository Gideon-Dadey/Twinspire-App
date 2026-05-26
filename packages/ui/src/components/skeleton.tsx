import * as React from 'react';

import { cn } from '../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply the shimmer animation (default) or just a static muted block. */
  animate?: boolean;
}

export function Skeleton({ className, animate = true, ...props }: SkeletonProps): React.JSX.Element {
  return (
    <div
      role="status"
      aria-busy
      aria-live="polite"
      className={cn(
        'rounded-md bg-muted/70',
        animate && 'animate-shimmer bg-shimmer-bg bg-shimmer',
        className,
      )}
      {...props}
    />
  );
}
