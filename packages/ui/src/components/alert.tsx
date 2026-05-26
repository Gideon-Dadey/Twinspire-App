import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/cn';

const alertVariants = cva(
  cn(
    'relative w-full rounded-lg border p-4 text-sm',
    '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4',
    '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]',
  ),
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground [&>svg]:text-muted-foreground',
        info: 'border-info/40 bg-info/10 text-info-foreground [&>svg]:text-info',
        success: 'border-success/40 bg-success/10 text-success-foreground [&>svg]:text-success',
        warning: 'border-warning/40 bg-warning/10 text-warning-foreground [&>svg]:text-warning',
        destructive: 'border-destructive/40 bg-destructive/10 text-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant, ...props },
  ref,
) {
  return (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  );
});

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function AlertTitle({ className, children, ...props }, ref) {
  return (
    <h5
      ref={ref}
      className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  );
});

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function AlertDescription({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('text-sm leading-relaxed [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
});
