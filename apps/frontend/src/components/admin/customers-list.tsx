'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Input,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import { Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { AdminCustomerListItem } from '@/lib/api/admin-types';
import { useAdminCustomers } from '@/lib/hooks/use-admin';

import { DataTable } from './data-table';
import { Paginator } from './paginator';

const STATUS_OPTIONS: Array<{ value: 'all' | AdminCustomerListItem['status']; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || 'TS';
}

export function CustomersList() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]['value']>('all');

  const { data, isLoading } = useAdminCustomers({ page, perPage: 20, q: q || undefined, status });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search customers"
            value={q}
            placeholder="Search by name or email"
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
            setStatus(v as typeof status);
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
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
        rowKey={(c) => c.id}
        rows={data?.items ?? []}
        columns={[
          {
            id: 'name',
            header: 'Customer',
            cell: (c) => (
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt={`${c.firstName} ${c.lastName}`} /> : null}
                  <AvatarFallback>{initials(c.firstName, c.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link href={`/admin/customers/${c.id}`} className="block truncate font-medium text-foreground hover:underline">
                    {c.firstName} {c.lastName}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (c) => <StatusBadge status={c.status} />,
          },
          {
            id: 'orders',
            header: 'Orders',
            align: 'right',
            cell: (c) => <span className="font-medium">{c.orderCount}</span>,
          },
          {
            id: 'ltv',
            header: 'Lifetime spend',
            align: 'right',
            cell: (c) => <Money value={c.lifetimeSpend} className="font-medium text-foreground" />,
          },
          {
            id: 'last-login',
            header: 'Last seen',
            cell: (c) => (
              <span className="text-muted-foreground">
                {c.lastLoginAt ? formatDate(c.lastLoginAt, { dateStyle: 'medium' }) : '—'}
              </span>
            ),
          },
          {
            id: 'created',
            header: 'Joined',
            cell: (c) => (
              <span className="text-muted-foreground">{formatDate(c.createdAt, { dateStyle: 'medium' })}</span>
            ),
          },
          {
            id: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (c) => (
              <Button asChild variant="ghost" size="sm" aria-label={`Open ${c.firstName} ${c.lastName}`}>
                <Link href={`/admin/customers/${c.id}`}>
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

function StatusBadge({ status }: { status: AdminCustomerListItem['status'] }) {
  switch (status) {
    case 'active':
      return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Active</Badge>;
    case 'suspended':
      return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">Suspended</Badge>;
    case 'banned':
      return <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">Banned</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}
