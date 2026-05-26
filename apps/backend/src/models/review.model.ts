import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  videoSchema,
  type ImageSchemaShape,
  type VideoSchemaShape,
} from './common.schemas';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface ReviewAttrs {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  authorName?: string;
  authorAvatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  images?: ImageSchemaShape[];
  videos?: VideoSchemaShape[];
  helpfulCount: number;
  notHelpfulCount: number;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  moderatorNote?: string;
  reportedCount: number;
}

export interface ReviewDoc extends ReviewAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type ReviewModelType = Model<ReviewDoc> & PaginatedModel<ReviewDoc>;

const reviewSchema = new Schema<ReviewDoc, ReviewModelType>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    authorName: { type: String, trim: true, maxlength: 120 },
    authorAvatarUrl: { type: String, trim: true, maxlength: 2048 },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    title: { type: String, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 6000 },
    images: { type: [imageSchema], default: undefined },
    videos: { type: [videoSchema], default: undefined },
    helpfulCount: { type: Number, default: 0, min: 0 },
    notHelpfulCount: { type: Number, default: 0, min: 0 },
    verifiedPurchase: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
      index: true,
    },
    moderatorNote: { type: String, maxlength: 480 },
    reportedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'reviews' },
);

applyBasePlugins(reviewSchema);

reviewSchema.index({ productId: 1, status: 1, rating: -1, createdAt: -1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model<ReviewDoc, ReviewModelType>('Review', reviewSchema);
export type ReviewDocument = HydratedDocument<ReviewDoc>;
