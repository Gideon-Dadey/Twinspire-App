import { Cart } from '../../models/cart.model';
import { Coupon, type CouponDoc } from '../../models/coupon.model';
import { Product } from '../../models/product.model';
import { pricingService, type PricingCartItem } from '../../services/pricing';
import { HttpError } from '../../utils/http-error';

import type { CouponListQuery } from './coupons.schemas';
import type { FilterQuery, Types } from 'mongoose';

export class CouponsService {
  /* ---------- Public ---------- */

  async validateForUser(
    code: string,
    opts: { userId?: string; sessionId?: string },
  ): Promise<unknown> {
    const identity = opts.userId ? { userId: opts.userId } : { sessionId: opts.sessionId };
    const cart = await Cart.findOne(identity);
    const pricingItems: PricingCartItem[] = [];

    if (cart && cart.items.length > 0) {
      const productIds = cart.items.map((i) => i.productId);
      const products = await Product.find(
        { _id: { $in: productIds } },
        { brandId: 1, categoryIds: 1 },
      ).lean();
      const productMap = new Map(products.map((p) => [String(p._id), p]));

      for (const item of cart.items) {
        const product = productMap.get(String(item.productId));
        pricingItems.push({
          productId: item.productId,
          variantId: item.variantId,
          unitPriceAmount: item.unitPrice.amount,
          quantity: item.quantity,
          categoryIds: (product?.categoryIds as (Types.ObjectId | string)[]) ?? [],
          brandId: (product?.brandId as Types.ObjectId | string) ?? '',
        });
      }
    }

    return pricingService.validateCoupon(code, {
      currency: cart?.currency ?? 'GHS',
      items: pricingItems,
      couponCodes: [],
      userId: opts.userId,
    });
  }

  /* ---------- Admin ---------- */

  async list(query: CouponListQuery): Promise<{ items: CouponDoc[]; meta: unknown }> {
    const filter: FilterQuery<CouponDoc> = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.q) filter.code = { $regex: new RegExp(query.q.toUpperCase(), 'i') };
    const paged = await Coupon.paginate(filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
    });
    return { items: paged.items, meta: paged.meta };
  }

  async getById(couponId: string): Promise<CouponDoc> {
    const coupon = await Coupon.findById(couponId).lean();
    if (!coupon) throw HttpError.notFound('Coupon not found');
    return coupon;
  }

  async create(input: Record<string, unknown>): Promise<CouponDoc> {
    const code = (input.code as string).toUpperCase();
    const existing = await Coupon.exists({ code });
    if (existing) throw HttpError.conflict('Coupon code already exists');
    const created = await Coupon.create({ ...input, code });
    return created.toObject();
  }

  async update(couponId: string, patch: Record<string, unknown>): Promise<CouponDoc> {
    if (patch.code) patch.code = (patch.code as string).toUpperCase();
    const updated = await Coupon.findByIdAndUpdate(couponId, { $set: patch }, { new: true });
    if (!updated) throw HttpError.notFound('Coupon not found');
    return updated.toObject();
  }

  async delete(couponId: string): Promise<void> {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw HttpError.notFound('Coupon not found');
    if (coupon.usedCount > 0) {
      coupon.isActive = false;
      await coupon.save();
      return;
    }
    await coupon.deleteOne();
  }

  async incrementUsage(couponCode: string): Promise<void> {
    await Coupon.updateOne({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
  }
}

export const couponsService = new CouponsService();
