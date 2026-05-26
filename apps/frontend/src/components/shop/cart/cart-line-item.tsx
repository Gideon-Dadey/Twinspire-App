'use client';

import type { CartItem } from '@twinspire/types';
import { Money, QuantityStepper } from '@twinspire/ui';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useCartStore } from '@/lib/stores/cart-store';

export function CartLineItem({ item }: { item: CartItem }): React.JSX.Element {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);

  return (
    <li className="flex gap-4 py-6">
      <Link
        href={`/products/${item.slug}`}
        className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-32"
      >
        {item.image && (
          <Image
            src={item.image.url}
            alt={item.image.alt}
            fill
            sizes="128px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="font-display text-base font-semibold tracking-tight hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">SKU: {item.sku}</p>
          </div>
          <Money value={item.lineTotal} className="font-semibold" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <QuantityStepper
            value={item.quantity}
            onValueChange={(next) => setQuantity(item.id, next)}
            min={1}
            max={20}
            size="sm"
            aria-label={`Quantity for ${item.name}`}
          />
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
