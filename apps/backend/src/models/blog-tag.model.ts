import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface BlogTagAttrs {
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogTagDoc extends BlogTagAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type BlogTagModelType = Model<BlogTagDoc> & PaginatedModel<BlogTagDoc>;

const blogTagSchema = new Schema<BlogTagDoc, BlogTagModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      match: /^[a-z0-9-]+$/,
    },
    postCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'blogTags' },
);

applyBasePlugins(blogTagSchema);

export const BlogTag = model<BlogTagDoc, BlogTagModelType>('BlogTag', blogTagSchema);
export type BlogTagDocument = HydratedDocument<BlogTagDoc>;
