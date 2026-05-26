import type { CartItem, CartTotals, Money } from '@twinspire/types';

const FREE_SHIPPING_THRESHOLD = 99;
const SHIPPING_FLAT_RATE = 9.95;
const TAX_RATE = 0.0825;

const zero = (currency: string): Money => ({ amount: 0, currency: currency as Money['currency'] });
const r2 = (n: number) => Math.round(n * 100) / 100;

export interface ComputeTotalsOptions {
  couponCode?: string;
  shippingOverride?: number;
  taxRate?: number;
}

export interface CouponSummary {
  code: string;
  description: string;
  amount: Money;
  applied: boolean;
}

export function compactItems(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of items) {
    const key = `${item.productId}-${item.variantId ?? 'default'}`;
    const existing = map.get(key);
    if (existing) {
      const quantity = existing.quantity + item.quantity;
      map.set(key, {
        ...existing,
        quantity,
        lineTotal: {
          amount: r2(existing.unitPrice.amount * quantity),
          currency: existing.unitPrice.currency,
        },
      });
    } else {
      map.set(key, item);
    }
  }
  return [...map.values()];
}

const COUPONS: Record<string, { description: string; apply: (subtotal: number) => number }> = {
  WELCOME10: {
    description: '10% off your first order',
    apply: (subtotal) => r2(subtotal * 0.1),
  },
  SHIP99: {
    description: 'Free shipping over $50',
    apply: () => SHIPPING_FLAT_RATE,
  },
  TWIN50: {
    description: '$50 off orders over $500',
    apply: (subtotal) => (subtotal >= 500 ? 50 : 0),
  },
};

export function lookupCoupon(code: string | undefined): CouponSummary | undefined {
  if (!code) return undefined;
  const found = COUPONS[code.toUpperCase()];
  if (!found) return undefined;
  return {
    code: code.toUpperCase(),
    description: found.description,
    amount: { amount: 0, currency: 'USD' },
    applied: false,
  };
}

export function computeTotals(items: CartItem[], options: ComputeTotalsOptions = {}): CartTotals {
  if (items.length === 0) {
    return {
      subtotal: zero('USD'),
      discount: zero('USD'),
      shipping: zero('USD'),
      tax: zero('USD'),
      total: zero('USD'),
      itemCount: 0,
    };
  }

  const currency = items[0]?.unitPrice.currency ?? 'USD';
  const subtotal = r2(items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  let shipping = options.shippingOverride ?? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE);

  const couponCode = options.couponCode?.toUpperCase();
  if (couponCode && COUPONS[couponCode]) {
    if (couponCode === 'SHIP99') {
      shipping = 0;
    } else {
      discount = COUPONS[couponCode].apply(subtotal);
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const taxRate = options.taxRate ?? TAX_RATE;
  const tax = r2(taxable * taxRate);
  const total = r2(taxable + shipping + tax);

  return {
    subtotal: { amount: subtotal, currency },
    discount: { amount: discount, currency },
    shipping: { amount: shipping, currency },
    tax: { amount: tax, currency },
    total: { amount: total, currency },
    itemCount,
  };
}

export const cartConstants = {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
  TAX_RATE,
};
