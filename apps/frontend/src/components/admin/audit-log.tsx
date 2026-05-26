'use client';

import { Badge, Input } from '@twinspire/ui';
import { formatRelativeTime } from '@twinspire/utils';
import { Search } from 'lucide-react';
import { useState } from 'react';

import { useAdminAudit } from '@/lib/hooks/use-admin';

import { DataTable } from './data-table';
import { Paginator } from './paginator';

export function AuditLog() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { data, isLoading } = useAdminAudit({ page, perPage: 20, q: q || undefined });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search audit log"
            value={q}
            placeholder="Search by actor, action, or entity ID"
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rowKey={(e) => e.id}
        rows={data?.items ?? []}
        columns={[
          {
            id: 'time',
            header: 'When',
            cell: (e) => (
              <span className="text-muted-foreground">{formatRelativeTime(e.createdAt)}</span>
            ),
          },
          {
            id: 'actor',
            header: 'Actor',
            cell: (e) => <span className="font-medium text-foreground">{e.actorName}</span>,
          },
          {
            id: 'action',
            header: 'Action',
            cell: (e) => (
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{e.action}</code>
            ),
          },
          {
            id: 'entity',
            header: 'Entity',
            cell: (e) => (
              <Badge variant="outline" className="capitalize">{e.entity}</Badge>
            ),
          },
          {
            id: 'entityId',
            header: 'Entity ID',
            cell: (e) => (
              <code className="text-xs text-muted-foreground">{e.entityId ?? '—'}</code>
            ),
          },
          {
            id: 'metadata',
            header: 'Detail',
            cell: (e) => (
              <span className="truncate text-xs text-muted-foreground">
                {e.metadata
                  ? Object.entries(e.metadata)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')
                  : ''}
              </span>
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
