import { type LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

type EmptyStateIcon = LucideIcon | React.ComponentType<{ className?: string }>;

export interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed',
        'bg-muted/30 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="bg-background flex size-12 items-center justify-center rounded-full shadow-sm">
          <Icon className="text-muted-foreground size-6" aria-hidden />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-foreground text-base font-semibold tracking-tight">
          {title}
        </p>
        {description && <p className="text-muted-foreground max-w-md text-sm">{description}</p>}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
