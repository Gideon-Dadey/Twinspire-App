import type { CartItem, CartTotals, Money } from '@twinspire/types';

/**
 * Ghana VAT effective rate — 12.5% (NHIL + GETFund + VAT combined). The legacy
 * `taxRate` option still wins if a caller wants to override per-cart (e.g. for
 * regions with different levies, B2B exempt customers, etc.).
 */
const TAX_RATE = 0.125;
const DEFAULT_CURRENCY: Money['currency'] = 'GHS';

const zero = (currency: string): Money => ({ amount: 0, currency: currency as Money['currency'] });
const r2 = (n: number) => Math.round(n * 100) / 100;

export interface ComputeTotalsOptions {
  couponCode?: string;
  /**
   * Always treated as 0 in production — TwinSpire is Ghana-only with phone-
   * coordinated delivery, no carrier rates. The option is kept on the interface
   * for source-compatibility with older call sites but is ignored.
   * @deprecated Shipping is always free; this value is no longer applied.
   */
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
  // ₵600 off orders over ₵6,000 (Ghana retail tier).
  TWIN50: {
    description: '₵600 off orders over ₵6,000',
    apply: (subtotal) => (subtotal >= 6000 ? 600 : 0),
  },
};

export function lookupCoupon(code: string | undefined): CouponSummary | undefined {
  if (!code) return undefined;
  const found = COUPONS[code.toUpperCase()];
  if (!found) return undefined;
  return {
    code: code.toUpperCase(),
    description: found.description,
    amount: { amount: 0, currency: DEFAULT_CURRENCY },
    applied: false,
  };
}

export function computeTotals(items: CartItem[], options: ComputeTotalsOptions = {}): CartTotals {
  if (items.length === 0) {
    return {
      subtotal: zero(DEFAULT_CURRENCY),
      discount: zero(DEFAULT_CURRENCY),
      shipping: zero(DEFAULT_CURRENCY),
      tax: zero(DEFAULT_CURRENCY),
      total: zero(DEFAULT_CURRENCY),
      itemCount: 0,
    };
  }

  const currency = items[0]?.unitPrice.currency ?? DEFAULT_CURRENCY;
  const subtotal = r2(items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let discount = 0;
  // Shipping is always 0 — phone-coordinated delivery, no carrier rates.
  const shipping = 0;

  const couponCode = options.couponCode?.toUpperCase();
  if (couponCode && COUPONS[couponCode]) {
    discount = COUPONS[couponCode].apply(subtotal);
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
  TAX_RATE,
};
