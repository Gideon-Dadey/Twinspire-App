'use client';

import {
  Button,
  Input,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@twinspire/ui';
import { formatRelativeTime } from '@twinspire/utils';
import { Eye, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { OrderStatus } from '@twinspire/types';

import { useAdminOrders } from '@/lib/hooks/use-admin';

import { DataTable } from './data-table';
import { OrderStatusPill } from './order-status-pill';
import { Paginator } from './paginator';

const STATUS_OPTIONS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'awaiting_payment', label: 'Awaiting payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'failed', label: 'Failed' },
];

const PER_PAGE = 15;

export function OrdersList() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') ?? 'all') as OrderStatus | 'all';

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const { data, isLoading } = useAdminOrders({
    page,
    perPage: PER_PAGE,
    q: q || undefined,
    status,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search orders"
            value={q}
            placeholder="Search by order number, customer, or email"
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v as OrderStatus | 'all');
          }}
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        loading={isLoading}
        rowKey={(o) => o.id}
        rows={data?.items ?? []}
        columns={[
          {
            id: 'order',
            header: 'Order',
            cell: (o) => (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {o.previewImages.length > 0 ? (
                    o.previewImages.slice(0, 3).map((src, i) => (
                      <span
                        key={i}
                        className="relative size-8 overflow-hidden rounded-md border border-border/60 bg-muted ring-2 ring-card"
                      >
                        <Image src={src} alt="" fill sizes="32px" className="object-cover" />
                      </span>
                    ))
                  ) : (
                    <span className="size-8 rounded-md border border-dashed border-border/60" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="block truncate font-medium text-foreground hover:underline"
                  >
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {o.itemCount} item{o.itemCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'customer',
            header: 'Customer',
            cell: (o) => (
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{o.customer.name}</p>
                <p className="truncate text-xs text-muted-foreground">{o.customer.email}</p>
              </div>
            ),
          },
          {
            id: 'placed',
            header: 'Placed',
            cell: (o) => (
              <span className="text-muted-foreground">{formatRelativeTime(o.placedAt)}</span>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (o) => <OrderStatusPill status={o.status} />,
          },
          {
            id: 'total',
            header: 'Total',
            align: 'right',
            cell: (o) => <Money value={o.total} className="font-medium text-foreground" />,
          },
          {
            id: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (o) => (
              <Button asChild variant="ghost" size="sm" aria-label={`Open ${o.orderNumber}`}>
                <Link href={`/admin/orders/${o.id}`}>
                  <Eye className="size-4" aria-hidden />
                </Link>
              </Button>
            ),
          },
        ]}
      />

      {data ? (
        <Paginator
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          perPage={data.perPage}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
