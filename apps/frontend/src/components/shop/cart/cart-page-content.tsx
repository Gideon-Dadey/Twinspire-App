'use client';

import { Button, EmptyState } from '@twinspire/ui';
import { ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { CartLineItem } from './cart-line-item';
import { CartSummary } from './cart-summary';
import { CouponForm } from './coupon-form';

import { cartConstants, computeTotals } from '@/lib/helpers/cart-math';
import { useCartStore } from '@/lib/stores/cart-store';

export function CartPageContent(): React.JSX.Element {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const totals = React.useMemo(() => computeTotals(items, { couponCode }), [items, couponCode]);

  const remainingForFreeShip = Math.max(0, cartConstants.FREE_SHIPPING_THRESHOLD - totals.subtotal.amount);

  if (items.length === 0) {
    return (
      <EmptyState
        className="max-w-xl"
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add a product to get started, or check out our deals."
        action={
          <Button asChild>
            <Link href="/deals">Shop deals</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
      <section className="space-y-4">
        {remainingForFreeShip > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
            <Truck className="size-3.5" aria-hidden />
            ${remainingForFreeShip.toFixed(2)} away from free shipping
          </div>
        )}

        <ul className="divide-y divide-border">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </ul>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="mb-3 text-sm font-semibold">Have a code?</p>
          <CouponForm />
        </div>
      </section>

      <CartSummary totals={totals} />
    </div>
  );
}
