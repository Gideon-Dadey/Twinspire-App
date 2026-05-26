import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  moneySchema,
  type ImageSchemaShape,
  type MoneySchemaShape,
} from './common.schemas';

export interface CartItemShape {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  sku: string;
  name: string;
  slug: string;
  image?: ImageSchemaShape;
  unitPrice: MoneySchemaShape;
  quantity: number;
  lineTotal: MoneySchemaShape;
  attributes?: Record<string, string>;
  addedAt: Date;
}

const cartItemSchema = new Schema<CartItemShape>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    sku: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 280 },
    slug: { type: String, required: true, trim: true, maxlength: 300 },
    image: { type: imageSchema, default: undefined },
    unitPrice: { type: moneySchema, required: true },
    quantity: { type: Number, required: true, min: 1, max: 999 },
    lineTotal: { type: moneySchema, required: true },
    attributes: { type: Schema.Types.Mixed, default: undefined },
    addedAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

export interface CartTotalsShape {
  subtotal: MoneySchemaShape;
  discount: MoneySchemaShape;
  shipping: MoneySchemaShape;
  tax: MoneySchemaShape;
  total: MoneySchemaShape;
  itemCount: number;
}

const cartTotalsSchema = new Schema<CartTotalsShape>(
  {
    subtotal: { type: moneySchema, required: true },
    discount: { type: moneySchema, required: true },
    shipping: { type: moneySchema, required: true },
    tax: { type: moneySchema, required: true },
    total: { type: moneySchema, required: true },
    itemCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

export interface CartAttrs {
  userId?: Types.ObjectId | null;
  sessionId?: string | null;
  currency: string;
  items: CartItemShape[];
  totals: CartTotalsShape;
  couponCodes: string[];
  notes?: string;
  expiresAt?: Date | null;
}

export interface CartDoc extends CartAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type CartModelType = Model<CartDoc> & PaginatedModel<CartDoc>;

const cartSchema = new Schema<CartDoc, CartModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    sessionId: { type: String, default: null, index: true, maxlength: 64 },
    currency: { type: String, required: true, uppercase: true, default: 'USD' },
    items: { type: [cartItemSchema], default: [] },
    totals: { type: cartTotalsSchema, required: true },
    couponCodes: { type: [{ type: String, uppercase: true, trim: true, maxlength: 48 }], default: [] },
    notes: { type: String, maxlength: 600 },
    expiresAt: { type: Date, default: null, index: { expires: 0 } },
  },
  { timestamps: true, collection: 'carts' },
);

applyBasePlugins(cartSchema);

cartSchema.index({ userId: 1, updatedAt: -1 });
cartSchema.index({ sessionId: 1, updatedAt: -1 });

export const Cart = model<CartDoc, CartModelType>('Cart', cartSchema);
export type CartDocument = HydratedDocument<CartDoc>;
