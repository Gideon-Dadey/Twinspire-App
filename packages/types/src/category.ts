import type { BaseEntity, ID, Image, SeoMetadata } from './common';

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  image?: Image;
  icon?: string;
  parentId?: ID | null;
  ancestors: ID[];
  level: number;
  path: string;
  position: number;
  isFeatured: boolean;
  isActive: boolean;
  productCount?: number;
  seo?: SeoMetadata;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
