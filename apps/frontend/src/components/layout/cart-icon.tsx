'use client';

import { faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';

import { useCartStore } from '@/lib/stores/cart-store';

export function CartIcon(): React.JSX.Element {
  const open = useCartStore((s) => s.open);
  const itemCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  return (
    <button
      type="button"
      onClick={open}
      className="text-muted-foreground hover:bg-muted hover:text-foreground relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
    >
      <FontAwesomeIcon icon={faBagShopping} className="h-[18px] w-[18px]" aria-hidden />
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
