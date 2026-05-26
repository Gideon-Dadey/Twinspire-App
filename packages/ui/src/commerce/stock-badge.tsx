import type { StockStatus } from '@twinspire/types';
import * as React from 'react';

import { Badge, type BadgeProps } from '../components/badge';

const labels: Record<StockStatus, { label: string; variant: BadgeProps['variant'] }> = {
  in_stock: { label: 'In stock', variant: 'success' },
  low_stock: { label: 'Low stock', variant: 'warning' },
  out_of_stock: { label: 'Out of stock', variant: 'destructive' },
  backorder: { label: 'Backorder', variant: 'info' },
  preorder: { label: 'Preorder', variant: 'info' },
};

export interface StockBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: StockStatus;
}

export function StockBadge({ status, size = 'sm', ...props }: StockBadgeProps): React.JSX.Element {
  const meta = labels[status];
  return (
    <Badge variant={meta.variant} size={size} {...props}>
      {meta.label}
    </Badge>
  );
}
