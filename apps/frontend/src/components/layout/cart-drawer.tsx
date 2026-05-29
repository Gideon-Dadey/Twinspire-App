'use client';

import {
  Money,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Button,
  Separator,
} from '@twinspire/ui';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { CartOutlineIcon } from '@/components/icons/cart-outline-icon';
import { computeTotals } from '@/lib/helpers/cart-math';
import { useCartStore } from '@/lib/stores/cart-store';

export function CartDrawer(): React.JSX.Element {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  const totals = React.useMemo(() => computeTotals(items, { couponCode }), [items, couponCode]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : close())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-border border-b px-4 py-4 sm:px-6">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <CartOutlineIcon className="size-5" /> Your cart
            <span className="text-muted-foreground text-sm font-normal">
              · {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:px-6">
            <CartOutlineIcon className="text-muted-foreground/40 size-10" />
            <p className="text-foreground text-sm font-medium">Your cart is empty</p>
            <p className="text-muted-foreground max-w-xs text-sm">
              Add a product to get started, or browse our best sellers.
            </p>
            <Button asChild className="mt-2">
              <Link href="/deals" onClick={close}>
                Shop deals
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-border bg-muted/40 text-muted-foreground border-b px-4 py-3 text-xs sm:px-6">
              Free delivery in Ghana · we&apos;ll call after payment to arrange a time.
            </div>

            <ul className="divide-border flex-1 divide-y overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-4 sm:px-6">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={close}
                    className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg"
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
                      className="hover:text-primary line-clamp-2 text-sm font-semibold"
                    >
                      {item.name}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      <Money value={item.unitPrice} /> each
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="border-border inline-flex items-center rounded-md border">
                        <button
                          type="button"
                          className="hover:bg-muted px-2 py-1 text-sm disabled:opacity-50"
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
                          className="hover:bg-muted px-2 py-1 text-sm"
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

            <div className="border-border border-t px-4 py-4 sm:px-6">
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
                  <dd className="text-success font-medium">Free</dd>
                </div>
              </dl>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total (incl. VAT)</span>
                <Money value={totals.total} className="text-lg font-semibold" />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={close}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/cart" onClick={close}>
                    View full cart
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
