import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface WishlistItemShape {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  priceAlertThreshold?: number;
  addedAt: Date;
}

const wishlistItemSchema = new Schema<WishlistItemShape>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    priceAlertThreshold: { type: Number, min: 0 },
    addedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

export interface WishlistAttrs {
  userId: Types.ObjectId;
  name: string;
  slug?: string;
  isPublic: boolean;
  items: WishlistItemShape[];
}

export interface WishlistDoc extends WishlistAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type WishlistModelType = Model<WishlistDoc> & PaginatedModel<WishlistDoc>;

const wishlistSchema = new Schema<WishlistDoc, WishlistModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80, default: 'My Wishlist' },
    slug: { type: String, trim: true, lowercase: true, maxlength: 120, index: { sparse: true } },
    isPublic: { type: Boolean, default: false, index: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true, collection: 'wishlists' },
);

applyBasePlugins(wishlistSchema);

wishlistSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Wishlist = model<WishlistDoc, WishlistModelType>('Wishlist', wishlistSchema);
export type WishlistDocument = HydratedDocument<WishlistDoc>;
