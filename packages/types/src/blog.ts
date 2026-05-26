import type { BaseEntity, ID, Image, SeoMetadata } from './common';

export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface BlogAuthor extends BaseEntity {
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  social?: { twitter?: string; linkedin?: string; website?: string };
}

export interface BlogTag extends BaseEntity {
  name: string;
  slug: string;
  postCount?: number;
}

export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  coverImage?: Image;
  authorId: ID;
  categorySlug?: string;
  tagIds: ID[];
  status: BlogPostStatus;
  publishedAt?: string;
  readingTimeMinutes?: number;
  views?: number;
  seo?: SeoMetadata;
  relatedPostIds?: ID[];
}
