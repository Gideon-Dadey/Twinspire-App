'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';

const labelVariants = cva(
  'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(function Label({ className, size, required, children, ...props }, ref) {
  return (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ size }), className)} {...props}>
      {children}
      {required && (
        <span aria-hidden className="ml-0.5 text-destructive">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
});
