'use client';

import { Badge, cn } from '@twinspire/ui';
import type { OrderStatus } from '@twinspire/types';

const LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  on_hold: 'On hold',
  failed: 'Failed',
};

const TONE: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  awaiting_payment: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  paid: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  processing: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  shipped: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  completed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  refunded: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  on_hold: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  failed: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
};

export function OrderStatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('h-5 rounded-full border px-2 py-0 text-[10px] uppercase tracking-wide', TONE[status], className)}>
      {LABEL[status]}
    </Badge>
  );
}
