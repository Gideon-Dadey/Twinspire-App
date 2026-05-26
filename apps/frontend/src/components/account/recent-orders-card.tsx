'use client';

import { Badge, Button, Money, Skeleton } from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import { ArrowRight, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useOrdersQuery } from '@/lib/hooks/use-orders';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'info' | 'warning' | 'destructive'> = {
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

export function RecentOrdersCard() {
  const { data, isLoading } = useOrdersQuery({ perPage: 4 });

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-display font-semibold tracking-tight">Recent orders</h2>
          <p className="text-xs text-muted-foreground">Track shipments and review past purchases.</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/account/orders">
            View all
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </header>

      <ul className="mt-5 divide-y divide-border">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="py-4">
                <Skeleton className="h-12 w-full" />
              </li>
            ))
          : data?.items.length
            ? data.items.map((order) => (
                <li key={order.id} className="py-4">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4"
                  >
                    <div className="flex -space-x-2">
                      {order.previewImages.length === 0 ? (
                        <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="size-4" aria-hidden />
                        </span>
                      ) : (
                        order.previewImages.slice(0, 3).map((src, i) => (
                          <Image
                            key={i}
                            src={src}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 rounded-lg border border-border object-cover"
                          />
                        ))
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.placedAt, { dateStyle: 'medium' })} · {order.itemCount} items
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-medium">
                        <Money value={order.total} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            : (
              <li className="py-10 text-center text-sm text-muted-foreground">
                You haven&apos;t placed any orders yet.
              </li>
            )}
      </ul>
    </section>
  );
}
