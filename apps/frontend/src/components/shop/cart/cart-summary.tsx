'use client';

import type { CartTotals } from '@twinspire/types';
import { Button, Money, Separator, cn } from '@twinspire/ui';
import Link from 'next/link';
import * as React from 'react';

export interface CartSummaryProps {
  totals: CartTotals;
  className?: string;
  showCheckoutButton?: boolean;
  buttonLabel?: string;
  buttonHref?: string;
  /** Renders an extra ReactNode below the line items (e.g. coupon input). */
  children?: React.ReactNode;
}

export function CartSummary({
  totals,
  className,
  showCheckoutButton = true,
  buttonLabel = 'Proceed to checkout',
  buttonHref = '/checkout',
  children,
}: CartSummaryProps): React.JSX.Element {
  return (
    <aside
      className={cn('border-border bg-card flex flex-col gap-4 rounded-lg border p-6', className)}
    >
      <h2 className="font-display text-lg font-semibold tracking-tight">Order summary</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">
            <Money value={totals.subtotal} />
          </dd>
        </div>
        {totals.discount.amount > 0 && (
          <div className="text-success flex items-center justify-between">
            <dt>Discount</dt>
            <dd>
              −<Money value={totals.discount} />
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="text-success font-medium">Free · arranged by phone</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">VAT (12.5%)</dt>
          <dd className="font-medium">
            <Money value={totals.tax} />
          </dd>
        </div>
      </dl>

      <Separator />

      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground text-sm">Total</span>
        <Money value={totals.total} className="text-2xl font-bold tracking-tight" />
      </div>

      {children}

      {showCheckoutButton && (
        <Button asChild size="lg" className="mt-2 w-full">
          <Link href={buttonHref}>{buttonLabel}</Link>
        </Button>
      )}

      <p className="text-muted-foreground text-center text-[11px]">
        Ghana VAT included · our team will call to confirm and arrange delivery.
      </p>
    </aside>
  );
}
