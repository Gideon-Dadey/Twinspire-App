'use client';

import { Skeleton, cn } from '@twinspire/ui';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  deltaPct?: number;
  deltaLabel?: string;
  description?: string;
  /** Optional trailing chart, e.g. a tiny sparkline. */
  trailing?: ReactNode;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPct,
  deltaLabel = 'vs. last period',
  description,
  trailing,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return <Skeleton className={cn('h-32 w-full rounded-2xl', className)} />;
  }
  const positive = typeof deltaPct === 'number' && deltaPct >= 0;
  const negative = typeof deltaPct === 'number' && deltaPct < 0;
  return (
    <div className={cn('flex flex-col gap-3 rounded-2xl border border-border bg-card p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-2xl font-semibold text-foreground sm:text-3xl">{value}</p>
        </div>
        <span aria-hidden className="rounded-xl bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          {typeof deltaPct === 'number' ? (
            <p
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                positive && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                negative && 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3" aria-hidden />
              ) : (
                <ArrowDownRight className="size-3" aria-hidden />
              )}
              {Math.abs(deltaPct).toFixed(1)}%
              <span className="text-muted-foreground">· {deltaLabel}</span>
            </p>
          ) : null}
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </div>
  );
}
