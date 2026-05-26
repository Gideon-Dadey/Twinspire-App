import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export type ActivityType =
  | 'page_view'
  | 'product_view'
  | 'category_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'checkout_start'
  | 'checkout_complete'
  | 'search'
  | 'review_submit'
  | 'review_helpful_vote'
  | 'profile_update'
  | 'login';

export interface ActivityLogAttrs {
  userId?: Types.ObjectId | null;
  sessionId?: string;
  type: ActivityType;
  url?: string;
  referrer?: string;
  productId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  query?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  country?: string;
}

export interface ActivityLogDoc extends ActivityLogAttrs {
  createdAt: Date;
  updatedAt: Date;
}

type ActivityLogModelType = Model<ActivityLogDoc> & PaginatedModel<ActivityLogDoc>;

const activityLogSchema = new Schema<ActivityLogDoc, ActivityLogModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    sessionId: { type: String, maxlength: 64, index: true },
    type: { type: String, required: true, index: true },
    url: { type: String, maxlength: 2048 },
    referrer: { type: String, maxlength: 2048 },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    query: { type: String, maxlength: 480 },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 480 },
    country: { type: String, maxlength: 4 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'activityLogs' },
);

applyBasePlugins(activityLogSchema, { softDelete: false });

activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const ActivityLog = model<ActivityLogDoc, ActivityLogModelType>(
  'ActivityLog',
  activityLogSchema,
);
export type ActivityLogDocument = HydratedDocument<ActivityLogDoc>;
