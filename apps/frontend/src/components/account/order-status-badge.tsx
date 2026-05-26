import { Badge, type BadgeProps } from '@twinspire/ui';
import type { OrderStatus } from '@twinspire/types';

const STATUS_VARIANT: Record<OrderStatus, NonNullable<BadgeProps['variant']>> = {
  pending: 'warning',
  awaiting_payment: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  completed: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
  on_hold: 'warning',
  failed: 'destructive',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
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

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
