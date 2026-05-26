'use client';

import { cn } from '@twinspire/ui';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

export interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({ title, defaultOpen = true, children, className }: FilterSectionProps): React.JSX.Element {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={cn('border-b border-border py-4', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm font-semibold"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-fast',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}
