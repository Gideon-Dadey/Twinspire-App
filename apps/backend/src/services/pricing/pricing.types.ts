import type { Types } from 'mongoose';

export interface PricingCartItem {
  productId: Types.ObjectId | string;
  variantId?: Types.ObjectId | string;
  unitPriceAmount: number;
  quantity: number;
  categoryIds: (Types.ObjectId | string)[];
  brandId: Types.ObjectId | string;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
  discountAmount: number;
  reason?: string;
}

export interface PricingResult {
  currency: string;
  subtotal: number;
  itemCount: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  appliedCoupons: AppliedCoupon[];
  rejectedCoupons: { code: string; reason: string }[];
  freeShipping: boolean;
}

export interface PricingContext {
  currency: string;
  items: PricingCartItem[];
  couponCodes: string[];
  userId?: string;
  isFirstOrder?: boolean;
  shippingAddressCountry?: string;
}
