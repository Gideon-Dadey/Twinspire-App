import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface BlogAuthorAttrs {
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  social?: { twitter?: string; linkedin?: string; website?: string };
  postCount: number;
}

export interface BlogAuthorDoc extends BlogAuthorAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type BlogAuthorModelType = Model<BlogAuthorDoc> & PaginatedModel<BlogAuthorDoc>;

const blogAuthorSchema = new Schema<BlogAuthorDoc, BlogAuthorModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 140,
      match: /^[a-z0-9-]+$/,
    },
    bio: { type: String, trim: true, maxlength: 4000 },
    avatarUrl: { type: String, trim: true, maxlength: 2048 },
    email: { type: String, trim: true, lowercase: true, maxlength: 240 },
    social: {
      twitter: { type: String, trim: true, maxlength: 2048 },
      linkedin: { type: String, trim: true, maxlength: 2048 },
      website: { type: String, trim: true, maxlength: 2048 },
    },
    postCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'blogAuthors' },
);

applyBasePlugins(blogAuthorSchema);

export const BlogAuthor = model<BlogAuthorDoc, BlogAuthorModelType>('BlogAuthor', blogAuthorSchema);
export type BlogAuthorDocument = HydratedDocument<BlogAuthorDoc>;
