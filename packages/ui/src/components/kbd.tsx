import * as React from 'react';

import { cn } from '../lib/cn';

/** Keyboard-shortcut chip. Renders as a `<kbd>` for screen readers. */
export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>): React.JSX.Element {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1',
        'font-mono text-[10px] font-semibold uppercase text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
