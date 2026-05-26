'use client';

import { ShoppingBag } from 'lucide-react';
import * as React from 'react';

import { useCartStore } from '@/lib/stores/cart-store';

export function CartIcon(): React.JSX.Element {
  const open = useCartStore((s) => s.open);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  return (
    <button
      type="button"
      onClick={open}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden />
      {itemCount > 0 && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
