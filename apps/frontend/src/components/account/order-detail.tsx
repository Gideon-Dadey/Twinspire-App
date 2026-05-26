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
      <div className="border-border bg-card rounded-lg border p-10 text-center">
        <p className="text-foreground text-sm font-semibold">Order not found</p>
        <p className="text-muted-foreground mt-1 text-xs">
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
  const canCancel = !['shipped', 'delivered', 'cancelled', 'refunded', 'completed'].includes(
    order.status,
  );

  return (
    <div className="space-y-8">
      <Link
        href="/account/orders"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs font-medium"
      >
        <ChevronLeft className="size-3.5" aria-hidden />
        Back to orders
      </Link>

      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-6">
        <div className="space-y-1">
          <p className="text-primary text-xs font-semibold uppercase tracking-wide">
            Order {order.orderNumber}
          </p>
          <h1 className="font-display flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            {order.items[0]?.name ?? 'Order details'}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-muted-foreground text-sm">
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
          <section className="border-border bg-card rounded-lg border p-6">
            <h2 className="text-base font-semibold">
              {order.items.length} item{order.items.length === 1 ? '' : 's'}
            </h2>
            <ul className="divide-border mt-4 divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start gap-4 py-4">
                  <div className="border-border bg-muted text-muted-foreground flex size-20 items-center justify-center rounded-lg border">
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
                      className="text-foreground text-sm font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-muted-foreground mt-0.5 text-xs">SKU {item.sku}</p>
                    <p className="text-muted-foreground mt-1 text-xs">Qty {item.quantity}</p>
                  </div>
                  <div className="text-right text-sm font-medium">
                    <Money value={item.lineTotal} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {order.shippingMethod?.trackingNumber ? (
            <section className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-6">
              <div className="flex items-start gap-3">
                <span aria-hidden className="bg-primary/10 text-primary rounded-lg p-2">
                  <Truck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Out for delivery via {order.shippingMethod.carrier ?? order.shippingMethod.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Reference {order.shippingMethod.trackingNumber}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Call dispatcher
              </Button>
            </section>
          ) : null}

          <section className="border-border bg-card rounded-lg border p-6">
            <h2 className="text-base font-semibold">Timeline</h2>
            <div className="mt-4">
              <OrderTimeline order={order} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border-border bg-card rounded-lg border p-6">
            <h2 className="text-base font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  <Money value={order.totals.subtotal} />
                </dd>
              </div>
              {order.totals.discount.amount > 0 ? (
                <div className="text-success flex items-center justify-between">
                  <dt>Discount</dt>
                  <dd>
                    − <Money value={order.totals.discount} />
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="text-success">Free</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">VAT</dt>
                <dd>
                  <Money value={order.totals.tax} />
                </dd>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>
                  <Money value={order.totals.total} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="border-border bg-card rounded-lg border p-6">
            <h2 className="text-base font-semibold">Delivery address</h2>
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
            </address>
          </section>

          {order.paymentMethod ? (
            <section className="border-border bg-card rounded-lg border p-6">
              <h2 className="text-base font-semibold">Payment</h2>
              <p className="text-muted-foreground mt-3 text-sm capitalize">
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
