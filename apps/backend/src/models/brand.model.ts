import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  seoSchema,
  type ImageSchemaShape,
  type SeoSchemaShape,
} from './common.schemas';

export interface BrandAttrs {
  name: string;
  slug: string;
  description?: string;
  logo?: ImageSchemaShape;
  banner?: ImageSchemaShape;
  website?: string;
  countryOfOrigin?: string;
  foundedYear?: number;
  isFeatured: boolean;
  isActive: boolean;
  productCount: number;
  seo?: SeoSchemaShape;
}

export interface BrandDoc extends BrandAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type BrandModelType = Model<BrandDoc> & PaginatedModel<BrandDoc>;

const brandSchema = new Schema<BrandDoc, BrandModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 140,
      match: /^[a-z0-9-]+$/,
    },
    description: { type: String, trim: true, maxlength: 4000 },
    logo: { type: imageSchema, default: undefined },
    banner: { type: imageSchema, default: undefined },
    website: { type: String, trim: true, maxlength: 2048 },
    countryOfOrigin: { type: String, trim: true, maxlength: 80 },
    foundedYear: { type: Number, min: 1800, max: 2200 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    productCount: { type: Number, default: 0, min: 0 },
    seo: { type: seoSchema, default: undefined },
  },
  { timestamps: true, collection: 'brands' },
);

applyBasePlugins(brandSchema);

brandSchema.index({ isActive: 1, isFeatured: -1, name: 1 });
brandSchema.index({ name: 'text', description: 'text' });

export const Brand = model<BrandDoc, BrandModelType>('Brand', brandSchema);
export type BrandDocument = HydratedDocument<BrandDoc>;
