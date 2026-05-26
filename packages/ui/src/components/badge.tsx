import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';

const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        accent: 'border-transparent bg-accent text-accent-foreground',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        info: 'border-transparent bg-info/15 text-info',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        outline: 'border-border bg-transparent text-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps): React.JSX.Element {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
