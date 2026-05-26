'use client';

import { Button, EmptyState } from '@twinspire/ui';
import { ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { CartLineItem } from './cart-line-item';
import { CartSummary } from './cart-summary';
import { CouponForm } from './coupon-form';

import { computeTotals } from '@/lib/helpers/cart-math';
import { useCartStore } from '@/lib/stores/cart-store';

export function CartPageContent(): React.JSX.Element {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const totals = React.useMemo(() => computeTotals(items, { couponCode }), [items, couponCode]);

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
        <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium">
          <Truck className="size-3.5" aria-hidden />
          Free delivery across Ghana · we&apos;ll call to arrange
        </div>

        <ul className="divide-border divide-y">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </ul>

        <div className="border-border bg-card rounded-lg border p-5">
          <p className="mb-3 text-sm font-semibold">Have a code?</p>
          <CouponForm />
        </div>
      </section>

      <CartSummary totals={totals} />
    </div>
  );
}
