'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

import { cn } from '../lib/cn';

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * App-wide Sonner toaster with TwinSpire styling.
 * Mount once in your root layout, then call `toast(...)` from anywhere.
 */
export function Toaster({ className, ...props }: ToasterProps): React.JSX.Element {
  return (
    <SonnerToaster
      theme="system"
      richColors
      closeButton
      position="top-right"
      duration={4500}
      className={cn('toaster', className)}
      toastOptions={{
        classNames: {
          toast:
            'group rounded-lg border border-border bg-background text-foreground shadow-lg backdrop-blur-sm',
          title: 'text-sm font-semibold tracking-tight',
          description: 'text-xs text-muted-foreground',
          actionButton:
            'bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium',
          cancelButton:
            'bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-xs font-medium',
        },
      }}
      {...props}
    />
  );
}

export { toast };
