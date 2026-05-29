'use client';

import * as React from 'react';

import { CartOutlineIcon } from '@/components/icons/cart-outline-icon';
import { useCartStore } from '@/lib/stores/cart-store';

export function CartIcon(): React.JSX.Element {
  const open = useCartStore((s) => s.open);
  const itemCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  return (
    <button
      type="button"
      onClick={open}
      className="text-foreground hover:bg-muted relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
    >
      <CartOutlineIcon />
      {itemCount > 0 && (
        <span
          aria-hidden
          className="bg-primary text-primary-foreground absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold shadow"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
