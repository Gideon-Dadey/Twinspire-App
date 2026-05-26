'use client';

import { Money, Sheet, SheetContent, SheetHeader, SheetTitle, Button, Separator } from '@twinspire/ui';
import { ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { computeTotals, cartConstants } from '@/lib/helpers/cart-math';
import { useCartStore } from '@/lib/stores/cart-store';

export function CartDrawer(): React.JSX.Element {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const totals = React.useMemo(() => computeTotals(items, { couponCode }), [items, couponCode]);
  const remainingForFreeShip = Math.max(0, cartConstants.FREE_SHIPPING_THRESHOLD - totals.subtotal.amount);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : close())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="size-5" aria-hidden /> Your cart
            <span className="text-sm font-normal text-muted-foreground">
              · {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/40" aria-hidden />
            <p className="text-sm font-medium text-foreground">Your cart is empty</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Add a product to get started, or browse our best sellers.
            </p>
            <Button asChild className="mt-2">
              <Link href="/deals" onClick={close}>Shop deals</Link>
            </Button>
          </div>
        ) : (
          <>
            {remainingForFreeShip > 0 && (
              <div className="border-b border-border bg-muted/40 px-6 py-3 text-xs text-muted-foreground">
                Add{' '}
                <Money
                  value={{ amount: remainingForFreeShip, currency: 'USD' }}
                  className="font-semibold text-foreground"
                />{' '}
                to unlock free shipping.
              </div>
            )}

            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 px-6 py-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={close}
                    className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {item.image && (
                      <Image
                        src={item.image.url}
                        alt={item.image.alt}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={close}
                      className="line-clamp-2 text-sm font-semibold hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      <Money value={item.unitPrice} /> each
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm hover:bg-muted disabled:opacity-50"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm hover:bg-muted"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Money value={item.lineTotal} className="text-sm font-semibold" />
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-4">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium"><Money value={totals.subtotal} /></dd>
                </div>
                {totals.discount.amount > 0 && (
                  <div className="flex items-center justify-between text-success">
                    <dt>Discount</dt>
                    <dd>−<Money value={totals.discount} /></dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium">
                    {totals.shipping.amount === 0 ? 'Free' : <Money value={totals.shipping} />}
                  </dd>
                </div>
              </dl>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated total</span>
                <Money value={totals.total} className="text-lg font-semibold" />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={close}>Checkout</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/cart" onClick={close}>View full cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
