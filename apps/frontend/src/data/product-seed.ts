import type { Product, ProductSpecification } from '@twinspire/types';

export interface ProductSeed {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  primaryCategoryId: string;
  categoryIds: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  price: { amount: number; compareAtAmount?: number; currency: 'GHS' };
  images: { url: string; alt: string }[];
  rating: { average: number; count: number };
  stockStatus: Product['stockStatus'];
  condition?: Product['condition'];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  releaseDate?: string;
  specifications: ProductSpecification[];
  attributes?: { name: string; value: string }[];
}
