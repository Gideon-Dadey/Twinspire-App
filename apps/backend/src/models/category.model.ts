import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  seoSchema,
  type ImageSchemaShape,
  type SeoSchemaShape,
} from './common.schemas';

export interface CategoryAttrs {
  name: string;
  slug: string;
  description?: string;
  image?: ImageSchemaShape;
  icon?: string;
  parentId?: Types.ObjectId | null;
  ancestors: Types.ObjectId[];
  level: number;
  path: string;
  position: number;
  isFeatured: boolean;
  isActive: boolean;
  productCount: number;
  seo?: SeoSchemaShape;
}

export interface CategoryDoc extends CategoryAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type CategoryModelType = Model<CategoryDoc> & PaginatedModel<CategoryDoc>;

const categorySchema = new Schema<CategoryDoc, CategoryModelType>(
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
    image: { type: imageSchema, default: undefined },
    icon: { type: String, trim: true, maxlength: 64 },
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    ancestors: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
      index: true,
    },
    level: { type: Number, default: 0, min: 0, max: 6, index: true },
    path: { type: String, default: '', index: true },
    position: { type: Number, default: 0, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    productCount: { type: Number, default: 0, min: 0 },
    seo: { type: seoSchema, default: undefined },
  },
  { timestamps: true, collection: 'categories' },
);

applyBasePlugins(categorySchema);

categorySchema.index({ parentId: 1, position: 1 });
categorySchema.index({ isActive: 1, isFeatured: -1, level: 1, position: 1 });
categorySchema.index({ name: 'text', description: 'text' });

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

export const Category = model<CategoryDoc, CategoryModelType>('Category', categorySchema);
export type CategoryDocument = HydratedDocument<CategoryDoc>;
