import type {
  BaseEntity,
  CurrencyCode,
  Dimensions,
  ID,
  Image,
  SeoMetadata,
  VideoAsset,
  Weight,
} from './common';

export type ProductStatus = 'draft' | 'published' | 'archived' | 'out_of_stock';
export type ProductCondition = 'new' | 'refurbished' | 'used' | 'open_box';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder';

export interface ProductAttributeValue {
  attributeId: ID;
  name: string;
  slug: string;
  value: string | number | boolean;
  displayValue?: string;
  unit?: string;
}

export interface ProductSpecification {
  group: string;
  key: string;
  value: string;
  position?: number;
}

export interface ProductPrice {
  amount: number;
  compareAtAmount?: number;
  currency: CurrencyCode;
  discountPercent?: number;
  taxRate?: number;
}

export interface ProductVariant extends BaseEntity {
  productId: ID;
  sku: string;
  barcode?: string;
  name: string;
  attributes: ProductAttributeValue[];
  price: ProductPrice;
  stock: number;
  reservedStock: number;
  reorderLevel: number;
  weight?: Weight;
  dimensions?: Dimensions;
  images: Image[];
  isDefault: boolean;
  isActive: boolean;
}

export interface ProductRatingSummary {
  average: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  brandId: ID;
  brandName?: string;
  categoryIds: ID[];
  primaryCategoryId: ID;
  tags: string[];
  condition: ProductCondition;
  status: ProductStatus;
  stockStatus: StockStatus;
  price: ProductPrice;
  images: Image[];
  videos?: VideoAsset[];
  threeSixtyUrl?: string;
  attributes: ProductAttributeValue[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  hasVariants: boolean;
  defaultVariantId?: ID;
  weight?: Weight;
  dimensions?: Dimensions;
  warranty?: { months: number; description?: string };
  shipping?: { freeShipping: boolean; classId?: ID; handlingDays?: number };
  rating?: ProductRatingSummary;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  releaseDate?: string;
  seo?: SeoMetadata;
}

export interface ProductSearchParams {
  q?: string;
  categoryId?: ID;
  categorySlug?: string;
  brandId?: ID;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  attributes?: Record<string, string[]>;
  tags?: string[];
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
}
