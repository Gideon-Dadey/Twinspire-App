'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Input,
  Money,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import type { Coupon, CurrencyCode } from '@twinspire/types';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useDeleteAdminCoupon,
  useUpdateAdminCoupon,
} from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';

import { CouponFormSheet, type CouponFormValues } from './coupon-form-sheet';
import { DataTable } from './data-table';
import { Paginator } from './paginator';

const PER_PAGE = 15;

export function CouponsPageContent() {
  const { user } = useSession();
  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const isActiveValue = activeFilter === 'all' ? undefined : activeFilter === 'active';
  const { data, isLoading } = useAdminCoupons({
    page,
    perPage: PER_PAGE,
    q: q || undefined,
    isActive: isActiveValue,
  });

  const createMutation = useCreateAdminCoupon();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const updateMutation = useUpdateAdminCoupon(editing?.id ?? '');
  const deleteMutation = useDeleteAdminCoupon();

  const [open, setOpen] = useState(false);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setOpen(true);
  }

  async function handleSubmit(values: CouponFormValues) {
    const currency = (values.currency ? values.currency.toUpperCase() : undefined) as
      | CurrencyCode
      | undefined;
    const payload = {
      code: values.code,
      description: values.description || undefined,
      type: values.type,
      value: values.value,
      currency,
      minSubtotal:
        typeof values.minSubtotal === 'number'
          ? { amount: values.minSubtotal, currency: (currency ?? 'GHS') as CurrencyCode }
          : undefined,
      usageLimit: typeof values.usageLimit === 'number' ? values.usageLimit : undefined,
      usageLimitPerUser:
        typeof values.usageLimitPerUser === 'number' ? values.usageLimitPerUser : undefined,
      startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : undefined,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
      isActive: values.isActive,
      stackable: values.stackable,
      firstOrderOnly: values.firstOrderOnly,
    };
    if (editing) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    setOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            aria-label="Search coupons"
            value={q}
            placeholder="Search by code or description"
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setPage(1);
            setActiveFilter(v as typeof activeFilter);
          }}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden /> New coupon
        </Button>
      </div>

      <DataTable
        loading={isLoading}
        rowKey={(c) => c.id}
        rows={data?.items ?? []}
        columns={[
          {
            id: 'code',
            header: 'Code',
            cell: (c) => (
              <div className="min-w-0">
                <p className="text-foreground font-mono text-sm font-semibold">{c.code}</p>
                {c.description ? (
                  <p className="text-muted-foreground truncate text-xs">{c.description}</p>
                ) : null}
              </div>
            ),
          },
          {
            id: 'type',
            header: 'Type',
            cell: (c) => formatType(c),
          },
          {
            id: 'usage',
            header: 'Usage',
            cell: (c) => (
              <div className="min-w-[120px]">
                <p className="text-muted-foreground text-xs">
                  {c.usedCount.toLocaleString()}
                  {c.usageLimit ? ` / ${c.usageLimit.toLocaleString()}` : ''}
                </p>
                {c.usageLimit ? (
                  <Progress
                    value={Math.min(100, (c.usedCount / c.usageLimit) * 100)}
                    className="mt-1 h-1.5"
                  />
                ) : null}
              </div>
            ),
          },
          {
            id: 'expires',
            header: 'Expires',
            cell: (c) => (
              <span className="text-muted-foreground">
                {c.expiresAt ? formatDate(c.expiresAt, { dateStyle: 'medium' }) : '—'}
              </span>
            ),
          },
          {
            id: 'flags',
            header: 'Flags',
            cell: (c) => (
              <div className="flex flex-wrap gap-1">
                {c.isActive ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Paused</Badge>
                )}
                {c.firstOrderOnly ? <Badge variant="secondary">First order</Badge> : null}
                {c.stackable ? <Badge variant="secondary">Stackable</Badge> : null}
              </div>
            ),
          },
          {
            id: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (c) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(c)}
                  aria-label={`Edit ${c.code}`}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${c.code}`}
                      disabled={!canDelete || deleteMutation.isPending}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete coupon {c.code}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Past redemptions will be preserved, but new orders won&apos;t be able to use
                        this code.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void deleteMutation.mutateAsync(c.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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

      <CouponFormSheet
        open={open}
        onOpenChange={setOpen}
        coupon={editing ?? undefined}
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function formatType(coupon: Coupon) {
  switch (coupon.type) {
    case 'percentage':
      return <span className="text-foreground">{coupon.value}% off</span>;
    case 'fixed':
      return (
        <span className="text-foreground">
          <Money
            value={{ amount: coupon.value, currency: (coupon.currency ?? 'GHS') as CurrencyCode }}
          />{' '}
          off
        </span>
      );
    case 'free_shipping':
      return <span className="text-foreground">Free delivery</span>;
    case 'bogo':
      return <span className="text-foreground">Buy 1, get 1 ({coupon.value}% off)</span>;
    default:
      return <span className="text-muted-foreground">{coupon.type}</span>;
  }
}
