import type { BaseEntity, ID, Money } from './common';

export type CouponType = 'percentage' | 'fixed' | 'free_shipping' | 'bogo';

export interface Coupon extends BaseEntity {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  currency?: string;
  minSubtotal?: Money;
  maxDiscount?: Money;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  applicableCategoryIds?: ID[];
  applicableBrandIds?: ID[];
  applicableProductIds?: ID[];
  excludedProductIds?: ID[];
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  campaignId?: ID;
  stackable: boolean;
  firstOrderOnly: boolean;
}
