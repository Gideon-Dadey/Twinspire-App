import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  dimensionsSchema,
  imageSchema,
  seoSchema,
  videoSchema,
  weightSchema,
  type DimensionsSchemaShape,
  type ImageSchemaShape,
  type SeoSchemaShape,
  type VideoSchemaShape,
  type WeightSchemaShape,
} from './common.schemas';

export type ProductStatus = 'draft' | 'published' | 'archived' | 'out_of_stock';
export type ProductCondition = 'new' | 'refurbished' | 'used' | 'open_box';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder';

/* ------------------------- Subschemas ------------------------- */

export interface ProductPriceShape {
  amount: number;
  compareAtAmount?: number;
  currency: string;
  discountPercent?: number;
  taxRate?: number;
}

const productPriceSchema = new Schema<ProductPriceShape>(
  {
    amount: { type: Number, required: true, min: 0 },
    compareAtAmount: { type: Number, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    discountPercent: { type: Number, min: 0, max: 100 },
    taxRate: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

export interface ProductAttributeValueShape {
  attributeId?: Types.ObjectId;
  name: string;
  slug: string;
  value: string;
  displayValue?: string;
  unit?: string;
}

const productAttributeValueSchema = new Schema<ProductAttributeValueShape>(
  {
    attributeId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 80 },
    value: { type: String, required: true, trim: true, maxlength: 240 },
    displayValue: { type: String, trim: true, maxlength: 240 },
    unit: { type: String, trim: true, maxlength: 32 },
  },
  { _id: false },
);

export interface ProductSpecificationShape {
  group: string;
  key: string;
  value: string;
  position?: number;
}

const productSpecificationSchema = new Schema<ProductSpecificationShape>(
  {
    group: { type: String, required: true, trim: true, maxlength: 80 },
    key: { type: String, required: true, trim: true, maxlength: 120 },
    value: { type: String, required: true, trim: true, maxlength: 600 },
    position: { type: Number, default: 0 },
  },
  { _id: false },
);

export interface ProductVariantShape {
  _id: Types.ObjectId;
  sku: string;
  barcode?: string;
  name: string;
  attributes: ProductAttributeValueShape[];
  price: ProductPriceShape;
  stock: number;
  reservedStock: number;
  reorderLevel: number;
  weight?: WeightSchemaShape;
  dimensions?: DimensionsSchemaShape;
  images: ImageSchemaShape[];
  isDefault: boolean;
  isActive: boolean;
}

const productVariantSchema = new Schema<ProductVariantShape>(
  {
    sku: { type: String, required: true, trim: true, maxlength: 64 },
    barcode: { type: String, trim: true, maxlength: 64 },
    name: { type: String, required: true, trim: true, maxlength: 240 },
    attributes: { type: [productAttributeValueSchema], default: [] },
    price: { type: productPriceSchema, required: true },
    stock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    weight: { type: weightSchema, default: undefined },
    dimensions: { type: dimensionsSchema, default: undefined },
    images: { type: [imageSchema], default: [] },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: false },
);

export interface ProductRatingShape {
  average: number;
  count: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

const productRatingSchema = new Schema<ProductRatingShape>(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
    distribution: {
      1: { type: Number, default: 0, min: 0 },
      2: { type: Number, default: 0, min: 0 },
      3: { type: Number, default: 0, min: 0 },
      4: { type: Number, default: 0, min: 0 },
      5: { type: Number, default: 0, min: 0 },
    },
  },
  { _id: false },
);

/* ------------------------- Main schema ------------------------- */

export interface ProductAttrs {
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  brandId: Types.ObjectId;
  brandName?: string;
  categoryIds: Types.ObjectId[];
  primaryCategoryId: Types.ObjectId;
  tags: string[];
  condition: ProductCondition;
  status: ProductStatus;
  stockStatus: StockStatus;
  price: ProductPriceShape;
  images: ImageSchemaShape[];
  videos?: VideoSchemaShape[];
  threeSixtyUrl?: string;
  attributes: ProductAttributeValueShape[];
  specifications: ProductSpecificationShape[];
  variants: ProductVariantShape[];
  hasVariants: boolean;
  defaultVariantId?: Types.ObjectId;
  weight?: WeightSchemaShape;
  dimensions?: DimensionsSchemaShape;
  warranty?: { months: number; description?: string };
  shipping?: { freeShipping: boolean; classId?: Types.ObjectId; handlingDays?: number };
  rating: ProductRatingShape;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  releaseDate?: Date;
  seo?: SeoSchemaShape;
  views: number;
  salesCount: number;
}

export interface ProductDoc extends ProductAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type ProductModelType = Model<ProductDoc> & PaginatedModel<ProductDoc>;

const productSchema = new Schema<ProductDoc, ProductModelType>(
  {
    sku: { type: String, required: true, unique: true, trim: true, maxlength: 64, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 280 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 300,
      match: /^[a-z0-9-]+$/,
    },
    shortDescription: { type: String, trim: true, maxlength: 480 },
    description: { type: String, required: true, maxlength: 20000 },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    brandName: { type: String, trim: true, maxlength: 120 },
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
      index: true,
    },
    primaryCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    tags: { type: [{ type: String, trim: true, lowercase: true, maxlength: 32 }], default: [] },
    condition: {
      type: String,
      enum: ['new', 'refurbished', 'used', 'open_box'],
      default: 'new',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'out_of_stock'],
      default: 'draft',
      index: true,
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'backorder', 'preorder'],
      default: 'in_stock',
      index: true,
    },
    price: { type: productPriceSchema, required: true },
    images: { type: [imageSchema], default: [] },
    videos: { type: [videoSchema], default: undefined },
    threeSixtyUrl: { type: String, trim: true, maxlength: 2048 },
    attributes: { type: [productAttributeValueSchema], default: [] },
    specifications: { type: [productSpecificationSchema], default: [] },
    variants: { type: [productVariantSchema], default: [] },
    hasVariants: { type: Boolean, default: false },
    defaultVariantId: { type: Schema.Types.ObjectId },
    weight: { type: weightSchema, default: undefined },
    dimensions: { type: dimensionsSchema, default: undefined },
    warranty: {
      months: { type: Number, min: 0, max: 240 },
      description: { type: String, trim: true, maxlength: 600 },
    },
    shipping: {
      freeShipping: { type: Boolean, default: false },
      classId: { type: Schema.Types.ObjectId },
      handlingDays: { type: Number, min: 0, max: 30 },
    },
    rating: { type: productRatingSchema, default: () => ({}) },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    releaseDate: { type: Date },
    seo: { type: seoSchema, default: undefined },
    views: { type: Number, default: 0, min: 0 },
    salesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'products' },
);

applyBasePlugins(productSchema);

/* Indexes — chosen for the highest-traffic catalog queries. */
productSchema.index({ status: 1, primaryCategoryId: 1, createdAt: -1 });
productSchema.index({ status: 1, brandId: 1, createdAt: -1 });
productSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });
productSchema.index({ status: 1, isBestSeller: -1, salesCount: -1 });
productSchema.index({ status: 1, isNewArrival: -1, releaseDate: -1 });
productSchema.index({ status: 1, 'price.amount': 1 });
productSchema.index({ status: 1, 'rating.average': -1, 'rating.count': -1 });
productSchema.index({ tags: 1, status: 1 });
productSchema.index(
  { name: 'text', description: 'text', brandName: 'text', tags: 'text' },
  {
    weights: { name: 10, brandName: 5, tags: 4, description: 1 },
    name: 'product_text_index',
  },
);

productSchema.pre('save', function syncStockStatus(this: HydratedDocument<ProductDoc>) {
  if (!this.hasVariants) return;
  const totalStock = this.variants.reduce((sum, v) => sum + v.stock, 0);
  if (totalStock === 0) this.stockStatus = 'out_of_stock';
  else if (totalStock < 5) this.stockStatus = 'low_stock';
  else this.stockStatus = 'in_stock';
});

export const Product = model<ProductDoc, ProductModelType>('Product', productSchema);
export type ProductDocument = HydratedDocument<ProductDoc>;
