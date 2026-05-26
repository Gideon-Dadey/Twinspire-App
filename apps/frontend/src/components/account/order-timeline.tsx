import { cn } from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import type { Order, OrderStatus } from '@twinspire/types';
import { Check, Circle } from 'lucide-react';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order placed',
  awaiting_payment: 'Awaiting payment',
  paid: 'Payment received',
  processing: 'Preparing for shipment',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  on_hold: 'On hold',
  failed: 'Failed',
};

export function OrderTimeline({ order }: { order: Order }) {
  const events = order.timeline.length
    ? order.timeline
    : [{ status: order.status, occurredAt: order.placedAt }];

  return (
    <ol className="space-y-4">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li key={`${event.status}-${event.occurredAt}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2',
                  isLast
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                )}
              >
                {isLast ? <Check className="size-3.5" /> : <Circle className="size-2 fill-current" />}
              </span>
              {index < events.length - 1 ? (
                <span aria-hidden className="mt-0.5 h-full w-px bg-border" />
              ) : null}
            </div>
            <div className="-mt-0.5 space-y-0.5 pb-3">
              <p className="text-sm font-medium text-foreground">
                {STATUS_LABELS[event.status] ?? event.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(event.occurredAt, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              {event.note ? (
                <p className="text-xs text-muted-foreground">{event.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
