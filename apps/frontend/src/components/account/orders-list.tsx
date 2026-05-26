'use client';

import {
  Button,
  EmptyState,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import type { OrderStatus } from '@twinspire/types';
import { ArrowRight, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { OrderStatusBadge } from '@/components/account/order-status-badge';
import { useOrdersQuery } from '@/lib/hooks/use-orders';

const STATUS_OPTIONS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'All orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrdersList() {
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useOrdersQuery({
    status: status === 'all' ? undefined : status,
    page,
    perPage: 10,
  });

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter:</span>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as 'all' | OrderStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          {data ? `${data.total} order${data.total === 1 ? '' : 's'}` : ''}
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : data?.items.length ? (
        <ul className="grid gap-3">
          {data.items.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="group flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40"
              >
                <div className="flex -space-x-2">
                  {order.previewImages.length === 0 ? (
                    <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Package className="size-5" aria-hidden />
                    </span>
                  ) : (
                    order.previewImages.slice(0, 3).map((src, i) => (
                      <Image
                        key={i}
                        src={src}
                        alt=""
                        width={48}
                        height={48}
                        className="size-12 rounded-lg border border-border object-cover"
                      />
                    ))
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    Order {order.orderNumber}
                    <OrderStatusBadge status={order.status} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Placed {formatDate(order.placedAt, { dateStyle: 'medium' })} · {order.itemCount} item
                    {order.itemCount === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-right text-sm font-semibold">
                  <Money value={order.total} />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When you place an order it will appear here so you can track delivery and re-buy in one click."
          action={
            <Button asChild>
              <Link href="/deals">Shop today&apos;s deals</Link>
            </Button>
          }
        />
      )}

      {data && data.totalPages > 1 ? (
        <footer className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= data.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </footer>
      ) : null}
    </section>
  );
}
