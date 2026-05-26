import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import { moneySchema, type MoneySchemaShape } from './common.schemas';

export type CouponType = 'percentage' | 'fixed' | 'free_shipping' | 'bogo';

export interface CouponAttrs {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  currency?: string;
  minSubtotal?: MoneySchemaShape;
  maxDiscount?: MoneySchemaShape;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  applicableCategoryIds?: Types.ObjectId[];
  applicableBrandIds?: Types.ObjectId[];
  applicableProductIds?: Types.ObjectId[];
  excludedProductIds?: Types.ObjectId[];
  startsAt: Date;
  expiresAt?: Date | null;
  isActive: boolean;
  campaignId?: Types.ObjectId | null;
  stackable: boolean;
  firstOrderOnly: boolean;
}

export interface CouponDoc extends CouponAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type CouponModelType = Model<CouponDoc> & PaginatedModel<CouponDoc>;

const couponSchema = new Schema<CouponDoc, CouponModelType>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 48,
      match: /^[A-Z0-9_-]+$/,
    },
    description: { type: String, trim: true, maxlength: 480 },
    type: { type: String, enum: ['percentage', 'fixed', 'free_shipping', 'bogo'], required: true },
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, uppercase: true, trim: true },
    minSubtotal: { type: moneySchema, default: undefined },
    maxDiscount: { type: moneySchema, default: undefined },
    usageLimit: { type: Number, min: 1 },
    usageLimitPerUser: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    applicableCategoryIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Category' }], default: undefined },
    applicableBrandIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Brand' }], default: undefined },
    applicableProductIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: undefined },
    excludedProductIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: undefined },
    startsAt: { type: Date, default: () => new Date(), index: true },
    expiresAt: { type: Date, default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', default: null, index: true },
    stackable: { type: Boolean, default: false },
    firstOrderOnly: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'coupons' },
);

applyBasePlugins(couponSchema);

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

couponSchema.methods.isCurrentlyValid = function isCurrentlyValid(now: Date = new Date()): boolean {
  if (!this.isActive) return false;
  if (this.startsAt && this.startsAt > now) return false;
  if (this.expiresAt && this.expiresAt < now) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

export const Coupon = model<CouponDoc, CouponModelType>('Coupon', couponSchema);
export type CouponDocument = HydratedDocument<CouponDoc>;
