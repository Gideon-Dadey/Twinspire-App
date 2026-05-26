'use client';

import { Badge, Button, Skeleton } from '@twinspire/ui';
import { formatRelativeTime } from '@twinspire/utils';
import { Laptop } from 'lucide-react';

import { useRevokeSession, useSessionsQuery } from '@/lib/hooks/use-sessions';

export function SessionsCard() {
  const { data, isLoading } = useSessionsQuery();
  const revoke = useRevokeSession();

  return (
    <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-semibold tracking-tight">Active sessions</h2>
          <p className="text-sm text-muted-foreground">
            Devices currently signed in to your account. Revoke anything you don&apos;t recognise.
          </p>
        </div>
      </header>

      <ul className="mt-5 divide-y divide-border">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <li key={i} className="py-4">
                <Skeleton className="h-12" />
              </li>
            ))
          : data?.sessions.length
            ? data.sessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="rounded-lg bg-muted p-2 text-muted-foreground">
                      <Laptop className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {session.deviceLabel ?? 'Unknown device'}{' '}
                        {session.isCurrent ? <Badge variant="success">This device</Badge> : null}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Last used {formatRelativeTime(session.lastUsedAt)} · IP {session.ipAddress ?? '—'}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={revoke.isPending && revoke.variables === session.id}
                      onClick={() => revoke.mutate(session.id)}
                    >
                      Revoke
                    </Button>
                  ) : null}
                </li>
              ))
            : (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No active sessions.
              </li>
            )}
      </ul>
    </section>
  );
}
