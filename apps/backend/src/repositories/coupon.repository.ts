import { Coupon, type CouponDoc } from '../models/coupon.model';

import { BaseRepository } from './base.repository';

export class CouponRepository extends BaseRepository<CouponDoc> {
  constructor() {
    super(Coupon);
  }

  findByCode(code: string): Promise<CouponDoc | null> {
    return this.findOne({ code: code.toUpperCase() });
  }

  async findCurrentlyValid(): Promise<CouponDoc[]> {
    const now = new Date();
    return this.find({
      isActive: true,
      startsAt: { $lte: now },
      $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
    });
  }

  async incrementUsage(code: string): Promise<void> {
    await Coupon.updateOne({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } }).exec();
  }
}

export const couponRepository = new CouponRepository();
