import type { BaseEntity, Image, SeoMetadata } from './common';

export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  logo?: Image;
  banner?: Image;
  website?: string;
  countryOfOrigin?: string;
  foundedYear?: number;
  isFeatured: boolean;
  isActive: boolean;
  productCount?: number;
  seo?: SeoMetadata;
}
