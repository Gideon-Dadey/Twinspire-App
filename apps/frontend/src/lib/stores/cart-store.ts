import type { CartItem, Product } from '@twinspire/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { compactItems } from '@/lib/helpers/cart-math';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  isOpen: boolean;
}

interface CartActions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  addProduct: (product: Product, quantity?: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  setItems: (items: CartItem[]) => void;
  applyCoupon: (code: string | undefined) => void;
  clear: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function toCartItem(product: Product, quantity: number): CartItem {
  const image = product.images?.[0];
  const unitPrice = { amount: product.price.amount, currency: product.price.currency };
  return {
    id: `${product.id}-${Date.now().toString(36)}`,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    image,
    unitPrice,
    quantity,
    lineTotal: { amount: unitPrice.amount * quantity, currency: unitPrice.currency },
    addedAt: nowIso(),
  };
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],
      couponCode: undefined,
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addProduct: (product, quantity = 1) =>
        set((s) => ({
          items: compactItems([...s.items, toCartItem(product, quantity)]),
          isOpen: true,
        })),
      setQuantity: (itemId, quantity) =>
        set((s) => ({
          items: s.items
            .map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity,
                    lineTotal: {
                      amount: item.unitPrice.amount * quantity,
                      currency: item.unitPrice.currency,
                    },
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      remove: (itemId) =>
        set((s) => ({ items: s.items.filter((item) => item.id !== itemId) })),
      setItems: (items) => set({ items }),
      applyCoupon: (couponCode) => set({ couponCode: couponCode?.toUpperCase() || undefined }),
      clear: () => set({ items: [], couponCode: undefined }),
    }),
    {
      name: 'twinspire.cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
    },
  ),
);
