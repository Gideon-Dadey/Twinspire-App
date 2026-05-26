import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface SearchHistoryAttrs {
  userId?: Types.ObjectId | null;
  sessionId?: string;
  query: string;
  normalizedQuery: string;
  filters?: Record<string, unknown>;
  resultCount?: number;
  clickedProductIds: Types.ObjectId[];
  country?: string;
}

export interface SearchHistoryDoc extends SearchHistoryAttrs {
  createdAt: Date;
}

type SearchHistoryModelType = Model<SearchHistoryDoc> & PaginatedModel<SearchHistoryDoc>;

const searchHistorySchema = new Schema<SearchHistoryDoc, SearchHistoryModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    sessionId: { type: String, maxlength: 64, index: true },
    query: { type: String, required: true, trim: true, maxlength: 240 },
    normalizedQuery: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 240,
      index: true,
    },
    filters: { type: Schema.Types.Mixed, default: undefined },
    resultCount: { type: Number, min: 0 },
    clickedProductIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
    country: { type: String, maxlength: 4 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'searchHistory' },
);

applyBasePlugins(searchHistorySchema, { softDelete: false });

searchHistorySchema.index({ normalizedQuery: 1, createdAt: -1 });
searchHistorySchema.index({ userId: 1, createdAt: -1 });

export const SearchHistory = model<SearchHistoryDoc, SearchHistoryModelType>(
  'SearchHistory',
  searchHistorySchema,
);
export type SearchHistoryDocument = HydratedDocument<SearchHistoryDoc>;
