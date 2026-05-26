import { env } from '../../config/env';
import { Coupon, type CouponDoc } from '../../models/coupon.model';
import { Order } from '../../models/order.model';

import type {
  AppliedCoupon,
  PricingCartItem,
  PricingContext,
  PricingResult,
} from './pricing.types';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Authoritative pricing engine. The frontend may show preliminary numbers, but
 * checkout/payment always relies on a server-quoted price.
 */
export class PricingService {
  async quote(ctx: PricingContext): Promise<PricingResult> {
    const subtotal = round2(
      ctx.items.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0),
    );
    const itemCount = ctx.items.reduce((sum, item) => sum + item.quantity, 0);

    const appliedCoupons: AppliedCoupon[] = [];
    const rejectedCoupons: { code: string; reason: string }[] = [];

    let discount = 0;
    let freeShipping = false;

    const dedupedCodes = Array.from(
      new Set(ctx.couponCodes.map((c) => c.trim().toUpperCase()).filter(Boolean)),
    );

    if (dedupedCodes.length > 0) {
      const coupons = await Coupon.find({ code: { $in: dedupedCodes } });
      const couponsByCode = new Map(coupons.map((c) => [c.code, c]));

      for (const code of dedupedCodes) {
        const coupon = couponsByCode.get(code);
        if (!coupon) {
          rejectedCoupons.push({ code, reason: 'NOT_FOUND' });
          continue;
        }
        const eligibility = await this.checkEligibility(coupon, ctx);
        if (!eligibility.ok) {
          rejectedCoupons.push({ code, reason: eligibility.reason });
          continue;
        }
        const applied = this.applyCoupon(coupon, ctx.items, subtotal, ctx.currency);
        if (applied.discountAmount === 0 && applied.type !== 'free_shipping') {
          rejectedCoupons.push({ code, reason: 'NO_EFFECT' });
          continue;
        }
        appliedCoupons.push(applied);
        discount += applied.discountAmount;
        if (applied.type === 'free_shipping') freeShipping = true;
        if (!coupon.stackable) break;
      }
    }

    discount = round2(Math.min(discount, subtotal));

    const subtotalAfterDiscount = round2(subtotal - discount);
    const shipping = this.calculateShipping(subtotalAfterDiscount, freeShipping);
    const tax = this.calculateTax(subtotalAfterDiscount, ctx.shippingAddressCountry);

    const total = round2(subtotalAfterDiscount + shipping + tax);

    return {
      currency: ctx.currency.toUpperCase(),
      subtotal,
      itemCount,
      discount,
      shipping,
      tax,
      total,
      appliedCoupons,
      rejectedCoupons,
      freeShipping,
    };
  }

  /** Stand-alone validation API used by `POST /coupons/validate`. */
  async validateCoupon(code: string, ctx: PricingContext): Promise<{ valid: boolean; reason?: string; preview?: AppliedCoupon }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return { valid: false, reason: 'NOT_FOUND' };
    const eligibility = await this.checkEligibility(coupon, ctx);
    if (!eligibility.ok) return { valid: false, reason: eligibility.reason };

    const subtotal = round2(
      ctx.items.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0),
    );
    const applied = this.applyCoupon(coupon, ctx.items, subtotal, ctx.currency);
    if (applied.discountAmount === 0 && applied.type !== 'free_shipping') {
      return { valid: false, reason: 'NO_EFFECT' };
    }
    return { valid: true, preview: applied };
  }

  /* ---------- private helpers ---------- */

  private calculateShipping(subtotalAfterDiscount: number, freeShipping: boolean): number {
    if (freeShipping) return 0;
    if (subtotalAfterDiscount === 0) return 0;
    if (subtotalAfterDiscount >= env.FREE_SHIPPING_THRESHOLD) return 0;
    return round2(env.SHIPPING_FLAT_RATE);
  }

  private calculateTax(subtotalAfterDiscount: number, _country?: string): number {
    if (env.TAX_RATE_DEFAULT <= 0) return 0;
    return round2(subtotalAfterDiscount * env.TAX_RATE_DEFAULT);
  }

  private async checkEligibility(
    coupon: CouponDoc,
    ctx: PricingContext,
  ): Promise<{ ok: true } | { ok: false; reason: string }> {
    const now = new Date();
    if (!coupon.isActive) return { ok: false, reason: 'INACTIVE' };
    if (coupon.startsAt && coupon.startsAt > now) return { ok: false, reason: 'NOT_STARTED' };
    if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, reason: 'EXPIRED' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { ok: false, reason: 'USAGE_LIMIT_REACHED' };
    }

    if (coupon.minSubtotal) {
      const subtotal = ctx.items.reduce(
        (sum, item) => sum + item.unitPriceAmount * item.quantity,
        0,
      );
      if (subtotal < coupon.minSubtotal.amount) {
        return { ok: false, reason: 'MIN_SUBTOTAL_NOT_MET' };
      }
    }

    if (coupon.firstOrderOnly && ctx.userId) {
      const orderCount = await Order.countDocuments({ userId: ctx.userId });
      if (orderCount > 0) return { ok: false, reason: 'FIRST_ORDER_ONLY' };
    }

    if (coupon.usageLimitPerUser && ctx.userId) {
      const used = await Order.countDocuments({
        userId: ctx.userId,
        couponCodes: coupon.code,
      });
      if (used >= coupon.usageLimitPerUser) {
        return { ok: false, reason: 'PER_USER_LIMIT_REACHED' };
      }
    }

    return { ok: true };
  }

  private applyCoupon(
    coupon: CouponDoc,
    items: PricingCartItem[],
    subtotal: number,
    _currency: string,
  ): AppliedCoupon {
    const eligibleItems = items.filter((item) => this.isItemEligible(coupon, item));
    const eligibleSubtotal = round2(
      eligibleItems.reduce((sum, item) => sum + item.unitPriceAmount * item.quantity, 0),
    );

    if (eligibleSubtotal === 0 && coupon.type !== 'free_shipping') {
      return { code: coupon.code, type: coupon.type, discountAmount: 0, reason: 'NO_ELIGIBLE_ITEMS' };
    }

    let discountAmount = 0;
    switch (coupon.type) {
      case 'percentage':
        discountAmount = round2((eligibleSubtotal * coupon.value) / 100);
        break;
      case 'fixed':
        discountAmount = round2(Math.min(coupon.value, eligibleSubtotal));
        break;
      case 'free_shipping':
        discountAmount = 0;
        break;
      case 'bogo': {
        const sortedByPrice = eligibleItems
          .flatMap((item) => Array(item.quantity).fill(item.unitPriceAmount) as number[])
          .sort((a, b) => a - b);
        const pairs = Math.floor(sortedByPrice.length / 2);
        for (let i = 0; i < pairs; i++) {
          discountAmount += sortedByPrice[i] ?? 0;
        }
        discountAmount = round2(discountAmount);
        break;
      }
    }

    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount.amount) {
      discountAmount = round2(coupon.maxDiscount.amount);
    }

    discountAmount = round2(Math.min(discountAmount, subtotal));

    return { code: coupon.code, type: coupon.type, discountAmount };
  }

  private isItemEligible(coupon: CouponDoc, item: PricingCartItem): boolean {
    const productId = String(item.productId);
    const brandId = String(item.brandId);
    const categoryIds = item.categoryIds.map(String);

    if (coupon.excludedProductIds?.some((id) => String(id) === productId)) return false;

    const hasProductRestriction = coupon.applicableProductIds && coupon.applicableProductIds.length > 0;
    const hasBrandRestriction = coupon.applicableBrandIds && coupon.applicableBrandIds.length > 0;
    const hasCategoryRestriction = coupon.applicableCategoryIds && coupon.applicableCategoryIds.length > 0;

    if (!hasProductRestriction && !hasBrandRestriction && !hasCategoryRestriction) return true;

    if (hasProductRestriction && coupon.applicableProductIds!.some((id) => String(id) === productId)) {
      return true;
    }
    if (hasBrandRestriction && coupon.applicableBrandIds!.some((id) => String(id) === brandId)) {
      return true;
    }
    if (
      hasCategoryRestriction &&
      coupon.applicableCategoryIds!.some((id) => categoryIds.includes(String(id)))
    ) {
      return true;
    }
    return false;
  }
}

export const pricingService = new PricingService();
