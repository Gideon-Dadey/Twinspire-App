import * as React from 'react';

import { cn } from '../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leftAddon, rightAddon, type = 'text', ...props },
  ref,
) {
  const baseClasses = cn(
    'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-xs',
    'placeholder:text-muted-foreground/70',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    invalid
      ? 'border-destructive focus-visible:ring-destructive'
      : 'border-input hover:border-foreground/30',
  );

  if (leftAddon != null || rightAddon != null) {
    return (
      <div
        className={cn(
          'group/input flex h-10 w-full items-stretch rounded-lg border bg-background shadow-xs',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background',
          invalid ? 'border-destructive focus-within:ring-destructive' : 'border-input',
          'transition-colors',
          className,
        )}
      >
        {leftAddon && (
          <span className="flex shrink-0 items-center gap-1.5 pl-3 text-sm text-muted-foreground">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          aria-invalid={invalid === true ? true : undefined}
          className={cn(
            'min-w-0 flex-1 bg-transparent px-3 py-2 text-sm',
            'placeholder:text-muted-foreground/70 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        />
        {rightAddon && (
          <span className="flex shrink-0 items-center gap-1.5 pr-3 text-sm text-muted-foreground">
            {rightAddon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid === true ? true : undefined}
      className={cn(baseClasses, className)}
      {...props}
    />
  );
});
