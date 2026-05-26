'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import { Mail, ShieldCheck, ShieldOff, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useAdminCustomer, useUpdateAdminCustomer } from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';
import type { AdminCustomerListItem } from '@/lib/api/admin-types';

import { OrderStatusPill } from './order-status-pill';

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || 'TS';
}

const STATUS_OPTIONS: Array<{ value: AdminCustomerListItem['status']; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

const ROLE_OPTIONS: Array<{ value: AdminCustomerListItem['role']; label: string }> = [
  { value: 'customer', label: 'Customer' },
  { value: 'support', label: 'Support' },
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Superadmin' },
];

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { user } = useSession();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const { data, isLoading, error } = useAdminCustomer(customerId);
  const updateMutation = useUpdateAdminCustomer(customerId);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Customer not found.{' '}
        <Link href="/admin/customers" className="text-primary hover:underline">
          Back to customers
        </Link>
      </div>
    );
  }

  const c = data.customer;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-16">
              {c.avatarUrl ? <AvatarImage src={c.avatarUrl} alt={`${c.firstName} ${c.lastName}`} /> : null}
              <AvatarFallback>{initials(c.firstName, c.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">
                {c.firstName} {c.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{c.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">{c.role}</Badge>
                <Badge
                  variant="outline"
                  className={
                    c.status === 'active'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : c.status === 'suspended'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : c.status === 'banned'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                          : 'border-border'
                  }
                >
                  {c.status}
                </Badge>
                {c.twoFactorEnabled ? (
                  <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                    <ShieldCheck className="mr-1 size-3" aria-hidden /> 2FA
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <ShieldOff className="mr-1 size-3" aria-hidden /> 2FA off
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lifetime spend</p>
              <Money value={c.lifetimeSpend} className="text-2xl font-semibold" />
              <p className="text-xs text-muted-foreground">{c.orderCount} orders</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Recent orders</h3>
          {c.recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {c.recentOrders.map((o) => (
                <li key={o.id} className="grid items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-3 text-sm sm:grid-cols-[1fr_auto_auto_auto]">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${o.id}`} className="block truncate font-medium hover:underline">
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">{o.itemCount} items</p>
                  </div>
                  <OrderStatusPill status={o.status} />
                  <Money value={o.total} className="text-sm font-medium" />
                  <Button asChild variant="ghost" size="sm" aria-label={`Open ${o.orderNumber}`}>
                    <Link href={`/admin/orders/${o.id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Contact</h3>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground inline-flex items-center gap-2"><Mail className="size-4" aria-hidden /> Email</dt>
              <dd className="text-foreground">{c.email}</dd>
            </div>
            {c.phone ? (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="text-foreground">{c.phone}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Joined</dt>
              <dd className="text-foreground">{formatDate(c.createdAt, { dateStyle: 'long' })}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Last seen</dt>
              <dd className="text-foreground">{c.lastLoginAt ? formatDate(c.lastLoginAt, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground inline-flex items-center gap-2"><Sparkles className="size-4" aria-hidden /> Loyalty</dt>
              <dd className="font-medium text-foreground">{c.loyaltyPoints.toLocaleString()} pts</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Account controls</h3>
          {!isAdmin ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Only admins can change status or role. Ask an admin to assist.
            </p>
          ) : null}
          <div className="mt-3 grid gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={c.status}
                onValueChange={(v) => void updateMutation.mutateAsync({ status: v as AdminCustomerListItem['status'] })}
                disabled={!isAdmin || updateMutation.isPending}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Role</label>
              <Select
                value={c.role}
                onValueChange={(v) => void updateMutation.mutateAsync({ role: v as AdminCustomerListItem['role'] })}
                disabled={!isAdmin || updateMutation.isPending || c.id === user?.id}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {c.id === user?.id ? (
                <p className="mt-1 text-[11px] text-muted-foreground">You can&apos;t change your own role.</p>
              ) : null}
            </div>
          </div>
        </section>

        {c.preferences ? (
          <section className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Preferences</h3>
            <dl className="mt-3 grid gap-2 text-sm">
              <Row label="Locale" value={c.preferences.locale} />
              <Row label="Currency" value={c.preferences.currency} />
              <Row label="Theme" value={c.preferences.theme ?? 'system'} />
              <Row label="Marketing" value={c.preferences.marketingOptIn ? 'Opted in' : 'Opted out'} />
              <Row label="Newsletter" value={c.preferences.newsletter ? 'Subscribed' : 'Unsubscribed'} />
            </dl>
          </section>
        ) : null}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="capitalize text-foreground">{value}</dd>
    </div>
  );
}
