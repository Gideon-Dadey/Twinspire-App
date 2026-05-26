import type { BaseEntity, ID, Image, Money } from './common';

export interface CartItem {
  id: ID;
  productId: ID;
  variantId?: ID;
  sku: string;
  name: string;
  slug: string;
  image?: Image;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
  attributes?: Record<string, string>;
  addedAt: string;
}

export interface CartTotals {
  subtotal: Money;
  discount: Money;
  shipping: Money;
  tax: Money;
  total: Money;
  itemCount: number;
}

export interface Cart extends BaseEntity {
  userId?: ID | null;
  sessionId?: string | null;
  currency: string;
  items: CartItem[];
  totals: CartTotals;
  couponCodes: string[];
  notes?: string;
  expiresAt?: string;
}

export interface AddToCartInput {
  productId: ID;
  variantId?: ID;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemId: ID;
  quantity: number;
}
