import { type LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border',
        'bg-muted/30 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
          <Icon className="size-6 text-muted-foreground" aria-hidden />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-base font-semibold tracking-tight text-foreground">{title}</p>
        {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
