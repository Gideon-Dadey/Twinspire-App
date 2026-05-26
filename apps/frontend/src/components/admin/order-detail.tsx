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
  FormField,
  Input,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import type { Order, OrderStatus } from '@twinspire/types';
import { Loader2, RefreshCcw, Truck, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { OrderTimeline } from '@/components/account/order-timeline';
import { useAdminOrder, useRefundAdminOrder, useUpdateAdminOrder } from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';

import { OrderStatusPill } from './order-status-pill';

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'awaiting_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'on_hold',
];

const FULFILMENT_OPTIONS: Array<{ value: Order['fulfillmentStatus']; label: string }> = [
  { value: 'unfulfilled', label: 'Unfulfilled' },
  { value: 'partial', label: 'Partially fulfilled' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'returned', label: 'Returned' },
  { value: 'restocked', label: 'Restocked' },
];

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = useAdminOrder(orderId);
  const updateMutation = useUpdateAdminOrder(orderId);
  const refundMutation = useRefundAdminOrder(orderId);
  const { user } = useSession();
  const canRefund = user?.role === 'admin' || user?.role === 'superadmin';

  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<Order['fulfillmentStatus'] | null>(
    null,
  );
  const [carrier, setCarrier] = useState('');
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');

  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState('');

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 w-full rounded-lg lg:col-span-2" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-sm">
        Order not found.{' '}
        <Link href="/admin/orders" className="text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = data.order;
  const customer = data.customer;

  const effectiveStatus = status ?? order.status;
  const effectiveFulfilment = fulfillmentStatus ?? order.fulfillmentStatus;
  const hasChanges =
    (status && status !== order.status) ||
    (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) ||
    (carrier && carrier !== (order.shippingMethod?.carrier ?? '')) ||
    (tracking && tracking !== (order.shippingMethod?.trackingNumber ?? '')) ||
    Boolean(note);

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        status: status ?? undefined,
        fulfillmentStatus: fulfillmentStatus ?? undefined,
        carrier: carrier || undefined,
        trackingNumber: tracking || undefined,
        note: note || undefined,
      });
      setStatus(null);
      setFulfillmentStatus(null);
      setCarrier('');
      setTracking('');
      setNote('');
    } catch {
      /* toast handled */
    }
  }

  async function handleRefund() {
    try {
      const amount = refundAmount ? Number(refundAmount) : undefined;
      await refundMutation.mutateAsync({ amount, reason: refundReason || undefined });
      setRefundAmount('');
      setRefundReason('');
    } catch {
      /* toast handled */
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Placed {formatDate(order.placedAt, { dateStyle: 'long', timeStyle: 'short' })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{order.orderNumber}</h2>
            <OrderStatusPill status={order.status} />
            <Badge variant="outline" className="capitalize">
              {order.paymentStatus.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {order.fulfillmentStatus.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Order total</p>
          <Money value={order.totals.total} className="text-foreground text-2xl font-semibold" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="border-border bg-card rounded-lg border p-5">
            <h3 className="text-sm font-semibold">
              {order.items.length} item{order.items.length === 1 ? '' : 's'}
            </h3>
            <ul className="divide-border/60 mt-3 divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span className="border-border/60 bg-muted relative size-12 overflow-hidden rounded-md border">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.alt ?? item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${item.productId}`}
                      className="text-foreground block truncate text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      SKU {item.sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <Money value={item.lineTotal} className="text-sm font-medium" />
                </li>
              ))}
            </ul>
          </section>

          <section className="border-border bg-card space-y-4 rounded-lg border p-5">
            <div>
              <h3 className="text-sm font-semibold">Fulfilment & status</h3>
              <p className="text-muted-foreground text-xs">
                Changes are appended to the order timeline.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="status" label="Status">
                <Select value={effectiveStatus} onValueChange={(v) => setStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="fulfillment" label="Fulfilment">
                <Select
                  value={effectiveFulfilment}
                  onValueChange={(v) => setFulfillmentStatus(v as Order['fulfillmentStatus'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FULFILMENT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="carrier" label="Dispatcher">
                <Input
                  placeholder={
                    order.shippingMethod?.carrier ?? 'TwinSpire Logistics · Bolt · in-house'
                  }
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                />
              </FormField>
              <FormField id="tracking" label="Delivery reference">
                <Input
                  placeholder={order.shippingMethod?.trackingNumber ?? 'TS-DEL-0001'}
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                />
              </FormField>
            </div>
            <FormField
              id="note"
              label="Internal note"
              description="Visible in audit log; optional."
            >
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </FormField>
            <div className="flex justify-end">
              <Button
                onClick={() => void handleSave()}
                disabled={!hasChanges || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Save changes
              </Button>
            </div>
          </section>

          <section className="border-border bg-card space-y-4 rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Refund</h3>
                <p className="text-muted-foreground text-xs">
                  Issues a refund through the original payment provider.
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {order.paymentStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <FormField
                id="refundAmount"
                label="Amount"
                description="Leave blank to refund total."
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={String(order.totals.total.amount)}
                />
              </FormField>
              <FormField id="refundReason" label="Reason">
                <Input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Customer requested return"
                />
              </FormField>
            </div>
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={!canRefund || refundMutation.isPending || order.status === 'refunded'}
                  >
                    <RefreshCcw className="size-4" aria-hidden />
                    Issue refund
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Issue refund?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The customer will be refunded{' '}
                      <strong>
                        <Money
                          value={{
                            amount: refundAmount ? Number(refundAmount) : order.totals.total.amount,
                            currency: order.totals.total.currency,
                          }}
                        />
                      </strong>{' '}
                      via the original payment method. This action is logged in the audit history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void handleRefund()}>
                      Refund
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {!canRefund ? (
              <p className="text-muted-foreground text-[11px]">
                Refunds require admin role. Ask a TwinSpire admin to process this refund.
              </p>
            ) : null}
          </section>

          <section className="border-border bg-card rounded-lg border p-5">
            <h3 className="text-sm font-semibold">Timeline</h3>
            <div className="mt-3">
              <OrderTimeline order={order} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="border-border bg-card rounded-lg border p-5">
            <h3 className="text-sm font-semibold">Customer</h3>
            {customer ? (
              <div className="mt-3 space-y-1">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  <span className="bg-primary/10 text-primary grid size-8 place-items-center rounded-full">
                    <User className="size-4" aria-hidden />
                  </span>
                  {customer.firstName} {customer.lastName}
                </Link>
                <p className="text-muted-foreground text-xs">{customer.email}</p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">
                Guest checkout · {order.guestEmail ?? '—'}
              </p>
            )}
          </section>

          <section className="border-border bg-card rounded-lg border p-5">
            <h3 className="text-sm font-semibold">Delivery</h3>
            <address className="text-muted-foreground mt-3 text-sm not-italic leading-relaxed">
              <p className="text-foreground">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                {order.shippingAddress.postalCode ? ` · ${order.shippingAddress.postalCode}` : ''}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-xs">{order.shippingAddress.phone}</p>
            </address>
            {order.shippingMethod ? (
              <p className="bg-muted text-muted-foreground mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide">
                <Truck className="size-3" aria-hidden />{' '}
                {order.shippingMethod.carrier ?? order.shippingMethod.name}
                {order.shippingMethod.trackingNumber
                  ? ` · ${order.shippingMethod.trackingNumber}`
                  : ''}
              </p>
            ) : null}
          </section>

          <section className="border-border bg-card rounded-lg border p-5">
            <h3 className="text-sm font-semibold">Totals</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Subtotal" value={<Money value={order.totals.subtotal} />} />
              {order.totals.discount.amount > 0 ? (
                <Row
                  label="Discount"
                  value={<Money value={order.totals.discount} />}
                  tone="success"
                />
              ) : null}
              <Row label="Delivery" value={<span className="text-success">Free</span>} />
              <Row label="VAT" value={<Money value={order.totals.tax} />} />
              <div className="border-border border-t pt-2">
                <Row label="Total" value={<Money value={order.totals.total} />} bold />
              </div>
            </dl>
            {order.couponCodes?.length ? (
              <p className="text-muted-foreground mt-3 text-xs">
                Coupons:{' '}
                {order.couponCodes.map((c) => (
                  <Badge key={c} variant="outline" className="mr-1">
                    {c}
                  </Badge>
                ))}
              </p>
            ) : null}
          </section>

          {order.notes ? (
            <section className="border-border bg-card rounded-lg border p-5">
              <h3 className="text-sm font-semibold">Internal notes</h3>
              <p className="text-muted-foreground mt-2 whitespace-pre-wrap text-xs">
                {order.notes}
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  tone?: 'success';
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <dt className={tone === 'success' ? 'text-emerald-600' : 'text-muted-foreground'}>{label}</dt>
      <dd
        className={
          bold
            ? 'text-foreground text-base font-semibold'
            : tone === 'success'
              ? 'text-emerald-600'
              : 'text-foreground'
        }
      >
        {value}
      </dd>
    </div>
  );
}
