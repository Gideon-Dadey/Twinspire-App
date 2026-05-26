import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import { imageSchema, type ImageSchemaShape } from './common.schemas';

export type BannerPlacement =
  | 'home_hero'
  | 'home_strip'
  | 'category_hero'
  | 'plp_inline'
  | 'pdp_inline'
  | 'cart'
  | 'checkout'
  | 'sitewide';

export interface BannerAttrs {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  placement: BannerPlacement;
  desktopImage: ImageSchemaShape;
  mobileImage?: ImageSchemaShape;
  backgroundColor?: string;
  textColor?: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
  campaignId?: Types.ObjectId | null;
  priority: number;
  isActive: boolean;
  audience?: 'all' | 'guests' | 'customers' | 'staff';
  impressions: number;
  clicks: number;
}

export interface BannerDoc extends BannerAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type BannerModelType = Model<BannerDoc> & PaginatedModel<BannerDoc>;

const bannerSchema = new Schema<BannerDoc, BannerModelType>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 320 },
    ctaLabel: { type: String, trim: true, maxlength: 64 },
    ctaUrl: { type: String, trim: true, maxlength: 2048 },
    placement: {
      type: String,
      enum: [
        'home_hero',
        'home_strip',
        'category_hero',
        'plp_inline',
        'pdp_inline',
        'cart',
        'checkout',
        'sitewide',
      ],
      required: true,
      index: true,
    },
    desktopImage: { type: imageSchema, required: true },
    mobileImage: { type: imageSchema, default: undefined },
    backgroundColor: { type: String, trim: true, maxlength: 24 },
    textColor: { type: String, trim: true, maxlength: 24 },
    startsAt: { type: Date, default: null, index: true },
    endsAt: { type: Date, default: null, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', default: null, index: true },
    priority: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    audience: {
      type: String,
      enum: ['all', 'guests', 'customers', 'staff'],
      default: 'all',
    },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'banners' },
);

applyBasePlugins(bannerSchema);

bannerSchema.index({ placement: 1, isActive: 1, priority: -1 });

export const Banner = model<BannerDoc, BannerModelType>('Banner', bannerSchema);
export type BannerDocument = HydratedDocument<BannerDoc>;
