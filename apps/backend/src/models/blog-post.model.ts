import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  imageSchema,
  seoSchema,
  type ImageSchemaShape,
  type SeoSchemaShape,
} from './common.schemas';

export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface BlogPostAttrs {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  coverImage?: ImageSchemaShape;
  authorId: Types.ObjectId;
  categorySlug?: string;
  tagIds: Types.ObjectId[];
  status: BlogPostStatus;
  publishedAt?: Date | null;
  scheduledFor?: Date | null;
  readingTimeMinutes: number;
  views: number;
  likes: number;
  seo?: SeoSchemaShape;
  relatedPostIds: Types.ObjectId[];
}

export interface BlogPostDoc extends BlogPostAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type BlogPostModelType = Model<BlogPostDoc> & PaginatedModel<BlogPostDoc>;

const blogPostSchema = new Schema<BlogPostDoc, BlogPostModelType>(
  {
    title: { type: String, required: true, trim: true, maxlength: 240 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 260,
      match: /^[a-z0-9-]+$/,
    },
    excerpt: { type: String, trim: true, maxlength: 480 },
    body: { type: String, required: true, maxlength: 200_000 },
    coverImage: { type: imageSchema, default: undefined },
    authorId: { type: Schema.Types.ObjectId, ref: 'BlogAuthor', required: true, index: true },
    categorySlug: { type: String, trim: true, lowercase: true, maxlength: 80, index: true },
    tagIds: { type: [{ type: Schema.Types.ObjectId, ref: 'BlogTag' }], default: [] },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null, index: true },
    scheduledFor: { type: Date, default: null, index: true },
    readingTimeMinutes: { type: Number, default: 1, min: 1 },
    views: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    seo: { type: seoSchema, default: undefined },
    relatedPostIds: { type: [{ type: Schema.Types.ObjectId, ref: 'BlogPost' }], default: [] },
  },
  { timestamps: true, collection: 'blogPosts' },
);

applyBasePlugins(blogPostSchema);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ title: 'text', excerpt: 'text', body: 'text' }, { name: 'blog_text_index' });

export const BlogPost = model<BlogPostDoc, BlogPostModelType>('BlogPost', blogPostSchema);
export type BlogPostDocument = HydratedDocument<BlogPostDoc>;
