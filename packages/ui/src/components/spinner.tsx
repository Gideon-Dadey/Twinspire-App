import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
}

const sizeMap = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
} as const;

export function Spinner({ size = 'md', label = 'Loading', className, ...props }: SpinnerProps): React.JSX.Element {
  return (
    <div role="status" aria-live="polite" className={cn('inline-flex items-center', className)} {...props}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeMap[size])} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
