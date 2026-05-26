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
        <div className="border-border bg-card rounded-lg border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
              Delivery
            </h3>
            <CheckCircle2 className="text-success size-4" aria-hidden />
          </div>
          <p className="font-medium">
            {shipping.firstName} {shipping.lastName}
          </p>
          <p className="text-muted-foreground text-sm">{shipping.line1}</p>
          {shipping.line2 && <p className="text-muted-foreground text-sm">{shipping.line2}</p>}
          <p className="text-muted-foreground text-sm">
            {shipping.city}, {shipping.state}
            {shipping.postalCode ? ` · ${shipping.postalCode}` : ''}
          </p>
          <p className="text-muted-foreground text-sm">{shipping.country}</p>
          <Separator className="my-3" />
          <p className="text-muted-foreground text-sm">
            Phone: <span className="text-foreground font-medium">{shipping.phone}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Email: <span className="text-foreground font-medium">{shipping.email}</span>
          </p>
          <p className="text-muted-foreground mt-3 text-xs">
            We&apos;ll call after payment to confirm and arrange delivery anywhere in Ghana.
          </p>
        </div>

        <div className="border-border bg-card rounded-lg border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
              Payment
            </h3>
            <CheckCircle2 className="text-success size-4" aria-hidden />
          </div>
          {payment.method === 'card' && (
            <>
              <p className="font-medium">{maskCardNumber(payment.cardNumber)}</p>
              <p className="text-muted-foreground text-sm">
                {payment.cardHolder ?? '—'} · Exp. {payment.expMonth ?? 'MM'}/
                {payment.expYear ?? 'YY'}
              </p>
            </>
          )}
          {payment.method === 'paypal' && (
            <p className="font-medium">PayPal — you&apos;ll be redirected to complete payment.</p>
          )}
          {payment.method === 'paystack' && (
            <>
              <p className="font-medium">
                Paystack ·{' '}
                {payment.paystackChannel === 'momo'
                  ? 'Mobile money'
                  : payment.paystackChannel === 'card'
                    ? 'Local card'
                    : 'Bank transfer'}
              </p>
              <p className="text-muted-foreground text-sm">
                {payment.paystackChannel === 'momo'
                  ? "You'll authorize via MTN, Vodafone, or AirtelTigo on the next step."
                  : payment.paystackChannel === 'card'
                    ? 'Enter your Visa, Mastercard, or Verve card on the Paystack page.'
                    : 'Complete a bank transfer or USSD payment on Paystack.'}
              </p>
            </>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </h3>
        <ul className="divide-border border-border bg-card divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-4">
              <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
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
                <p className="text-muted-foreground text-xs">Qty {item.quantity}</p>
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
