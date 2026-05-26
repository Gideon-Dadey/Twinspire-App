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
  Button,
  Money,
  Skeleton,
} from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import { ChevronLeft, Download, Package, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { OrderStatusBadge } from '@/components/account/order-status-badge';
import { OrderTimeline } from '@/components/account/order-timeline';
import { useCancelOrder, useOrderQuery } from '@/lib/hooks/use-orders';

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data, isLoading, error } = useOrderQuery(orderId);
  const cancel = useCancelOrder();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32" />
        <Skeleton className="h-60" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-sm font-semibold text-foreground">Order not found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {(error as { message?: string } | null)?.message ??
            'We could not find that order on your account.'}
        </p>
        <Button asChild className="mt-4">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const order = data.order;
  const canCancel = !['shipped', 'delivered', 'cancelled', 'refunded', 'completed'].includes(order.status);

  return (
    <div className="space-y-8">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        Back to orders
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Order {order.orderNumber}
          </p>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-display font-semibold tracking-tight">
            {order.items[0]?.name ?? 'Order details'}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.placedAt, { dateStyle: 'long' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" disabled={!order.invoiceUrl}>
            <a
              href={order.invoiceUrl ?? '#'}
              aria-disabled={!order.invoiceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Download aria-hidden /> Invoice
            </a>
          </Button>
          {canCancel ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Cancel order</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Once cancelled, any payment is refunded to the original payment method within
                    3–5 business days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancel.mutate(order.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">
              {order.items.length} item{order.items.length === 1 ? '' : 's'}
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start gap-4 py-4">
                  <div className="flex size-20 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.image.alt ?? item.name}
                        width={80}
                        height={80}
                        className="size-20 rounded-lg object-cover"
                      />
                    ) : (
                      <Package className="size-6" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">SKU {item.sku}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <div className="text-right text-sm font-medium">
                    <Money value={item.lineTotal} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {order.shippingMethod?.trackingNumber ? (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <span aria-hidden className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Truck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Shipped with {order.shippingMethod.carrier ?? order.shippingMethod.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Tracking number {order.shippingMethod.trackingNumber}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Track package
              </Button>
            </section>
          ) : null}

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Timeline</h2>
            <div className="mt-4">
              <OrderTimeline order={order} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  <Money value={order.totals.subtotal} />
                </dd>
              </div>
              {order.totals.discount.amount > 0 ? (
                <div className="flex items-center justify-between text-success">
                  <dt>Discount</dt>
                  <dd>
                    − <Money value={order.totals.discount} />
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>
                  <Money value={order.totals.shipping} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Tax</dt>
                <dd>
                  <Money value={order.totals.tax} />
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>
                  <Money value={order.totals.total} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Shipping address</h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </section>

          {order.paymentMethod ? (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">Payment</h2>
              <p className="mt-3 text-sm capitalize text-muted-foreground">
                {order.paymentMethod.provider}
                {order.paymentMethod.last4 ? ` • ending in ${order.paymentMethod.last4}` : ''}
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
