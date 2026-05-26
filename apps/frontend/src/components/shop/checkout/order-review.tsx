'use client';

import type { CartItem } from '@twinspire/types';
import { Button, Money, Separator } from '@twinspire/ui';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import type { PaymentFormValues, ShippingFormValues } from './checkout-schemas';

export interface OrderReviewProps {
  items: CartItem[];
  shipping: ShippingFormValues;
  payment: PaymentFormValues;
  onBack: () => void;
  onPlaceOrder: () => void | Promise<void>;
}

function maskCardNumber(value: string | undefined): string {
  if (!value) return '•••• •••• •••• 4242';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return value;
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export function OrderReview({ items, shipping, payment, onBack, onPlaceOrder }: OrderReviewProps) {
  const [submitting, setSubmitting] = React.useState(false);

  async function handlePlace() {
    setSubmitting(true);
    try {
      await onPlaceOrder();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Shipping
            </h3>
            <CheckCircle2 className="size-4 text-success" aria-hidden />
          </div>
          <p className="font-medium">
            {shipping.firstName} {shipping.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{shipping.line1}</p>
          {shipping.line2 && <p className="text-sm text-muted-foreground">{shipping.line2}</p>}
          <p className="text-sm text-muted-foreground">
            {shipping.city}, {shipping.state} {shipping.postalCode}
          </p>
          <p className="text-sm text-muted-foreground">{shipping.country}</p>
          <Separator className="my-3" />
          <p className="text-sm text-muted-foreground">
            Method: <span className="font-medium text-foreground">{shipping.shippingMethod}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Contact: <span className="font-medium text-foreground">{shipping.email}</span>
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Payment
            </h3>
            <CheckCircle2 className="size-4 text-success" aria-hidden />
          </div>
          {payment.method === 'card' ? (
            <>
              <p className="font-medium">{maskCardNumber(payment.cardNumber)}</p>
              <p className="text-sm text-muted-foreground">
                {payment.cardHolder ?? '—'} · Exp. {payment.expMonth ?? 'MM'}/{payment.expYear ?? 'YY'}
              </p>
            </>
          ) : (
            <p className="font-medium">PayPal — you'll be redirected to complete payment.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </h3>
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image && (
                  <Image
                    src={item.image.url}
                    alt={item.image.alt}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <Money value={item.lineTotal} className="font-semibold" />
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" onClick={onBack} leftIcon={<ArrowLeft aria-hidden />}>
          Back to payment
        </Button>
        <Button type="button" size="lg" onClick={handlePlace} loading={submitting}>
          Place order
        </Button>
      </div>
    </div>
  );
}
