import * as React from 'react';

import { cn } from '../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid === true ? true : undefined}
      className={cn(
        'flex min-h-[88px] w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-xs',
        'placeholder:text-muted-foreground/70 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid
          ? 'border-destructive focus-visible:ring-destructive'
          : 'border-input hover:border-foreground/30',
        className,
      )}
      {...props}
    />
  );
});
