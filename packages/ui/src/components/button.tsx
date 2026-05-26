'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export const buttonVariants = cva(
  cn(
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg',
    'text-sm font-medium tracking-tight transition-all duration-fast ease-out-expo',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-600 active:translate-y-px',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:translate-y-px',
        outline:
          'border border-input bg-transparent text-foreground hover:bg-muted hover:text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85 active:translate-y-px',
        ghost: 'bg-transparent text-foreground hover:bg-muted hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        accent:
          'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:translate-y-px',
        success:
          'bg-success text-success-foreground shadow-sm hover:bg-success/90 active:translate-y-px',
      },
      size: {
        xs: 'h-7 gap-1 px-2.5 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'size-10 p-0',
        'icon-sm': 'size-8 p-0',
        'icon-lg': 'size-11 p-0',
      },
      fullWidth: { true: 'w-full' },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    rounded,
    asChild = false,
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = Boolean(disabled) || loading;
  const sharedClassName = cn(buttonVariants({ variant, size, fullWidth, rounded }), className);
  const sharedProps = {
    className: sharedClassName,
    'aria-busy': loading === true ? true : undefined,
    'aria-disabled': isDisabled ? true : undefined,
    'data-loading': loading === true ? '' : undefined,
  };

  if (asChild) {
    /**
     * When delegating to a child element via Radix `Slot`, we must pass exactly
     * one React child for `cloneElement` to merge props into. We therefore
     * forward the consumer's child untouched and ignore loading/leftIcon/
     * rightIcon (consumers using `asChild` are expected to render their own
     * inner content).
     */
    return (
      <Slot ref={ref} {...sharedProps} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      {...sharedProps}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
