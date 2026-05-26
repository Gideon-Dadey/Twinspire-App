import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

/**
 * Generic analytics event store. Use this for high-cardinality, append-only
 * events that don't fit cleanly into the typed `ActivityLog` enum.
 *
 * For production scale, this collection should be replaced or paired with a
 * dedicated columnar store (ClickHouse, BigQuery). Mongo is fine for
 * single-region MVPs and product analytics dashboards.
 */
export interface AnalyticsEventAttrs {
  name: string;
  userId?: Types.ObjectId | null;
  sessionId?: string;
  anonymousId?: string;
  properties?: Record<string, unknown>;
  context?: { ip?: string; userAgent?: string; locale?: string; country?: string };
  timestamp: Date;
}

export interface AnalyticsEventDoc extends AnalyticsEventAttrs {
  createdAt: Date;
}

type AnalyticsEventModelType = Model<AnalyticsEventDoc> & PaginatedModel<AnalyticsEventDoc>;

const analyticsEventSchema = new Schema<AnalyticsEventDoc, AnalyticsEventModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    sessionId: { type: String, maxlength: 64, index: true },
    anonymousId: { type: String, maxlength: 64, index: true },
    properties: { type: Schema.Types.Mixed, default: undefined },
    context: {
      ip: { type: String, maxlength: 64 },
      userAgent: { type: String, maxlength: 480 },
      locale: { type: String, maxlength: 16 },
      country: { type: String, maxlength: 4 },
    },
    timestamp: { type: Date, required: true, default: () => new Date(), index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'analyticsEvents' },
);

applyBasePlugins(analyticsEventSchema, { softDelete: false });

analyticsEventSchema.index({ name: 1, timestamp: -1 });

export const AnalyticsEvent = model<AnalyticsEventDoc, AnalyticsEventModelType>(
  'AnalyticsEvent',
  analyticsEventSchema,
);
export type AnalyticsEventDocument = HydratedDocument<AnalyticsEventDoc>;
