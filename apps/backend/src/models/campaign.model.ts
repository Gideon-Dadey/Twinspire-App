import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  seoSchema,
  type ImageSchemaShape,
  type SeoSchemaShape,
} from './common.schemas';

export type CampaignType =
  | 'discount'
  | 'flash_sale'
  | 'holiday'
  | 'clearance'
  | 'launch'
  | 'bundle';

export interface CampaignAttrs {
  name: string;
  slug: string;
  description?: string;
  type: CampaignType;
  banner?: ImageSchemaShape;
  heroImage?: ImageSchemaShape;
  badgeText?: string;
  badgeColor?: string;
  startsAt: Date;
  endsAt?: Date | null;
  productIds: Types.ObjectId[];
  categoryIds: Types.ObjectId[];
  brandIds: Types.ObjectId[];
  couponIds: Types.ObjectId[];
  isActive: boolean;
  priority: number;
  seo?: SeoSchemaShape;
}

export interface CampaignDoc extends CampaignAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type CampaignModelType = Model<CampaignDoc> & PaginatedModel<CampaignDoc>;

const campaignSchema = new Schema<CampaignDoc, CampaignModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180,
      match: /^[a-z0-9-]+$/,
    },
    description: { type: String, trim: true, maxlength: 4000 },
    type: {
      type: String,
      enum: ['discount', 'flash_sale', 'holiday', 'clearance', 'launch', 'bundle'],
      required: true,
      index: true,
    },
    banner: { type: imageSchema, default: undefined },
    heroImage: { type: imageSchema, default: undefined },
    badgeText: { type: String, trim: true, maxlength: 32 },
    badgeColor: { type: String, trim: true, maxlength: 24 },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, default: null, index: true },
    productIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
    categoryIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Category' }], default: [] },
    brandIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Brand' }], default: [] },
    couponIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 0, index: true },
    seo: { type: seoSchema, default: undefined },
  },
  { timestamps: true, collection: 'campaigns' },
);

applyBasePlugins(campaignSchema);

campaignSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export const Campaign = model<CampaignDoc, CampaignModelType>('Campaign', campaignSchema);
export type CampaignDocument = HydratedDocument<CampaignDoc>;
