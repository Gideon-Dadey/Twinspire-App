import { SUPPORTED_CURRENCIES } from '@twinspire/utils';
import { z } from 'zod';


const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const moneySchema = z.object({
  amount: z.number().min(0),
  currency: z.enum(SUPPORTED_CURRENCIES),
});

export const productSortSchema = z
  .enum(['newest', 'price-asc', 'price-desc', 'rating', 'popular', 'name'])
  .default('newest');

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  sort: productSortSchema,
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  brand: z
    .string()
    .trim()
    .max(240)
    .optional()
    .transform((v) => (v ? v.split(',').slice(0, 20) : undefined)),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: z.enum(['new', 'refurbished', 'open_box', 'used']).optional(),
  inStock: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => v === true || v === 'true'),
  tag: z.string().trim().max(60).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1).max(160),
});

export const productIdParamsSchema = z.object({
  productId: objectId,
});

export const categorySlugParamsSchema = z.object({
  slug: z.string().min(1).max(160),
});

export const brandSlugParamsSchema = z.object({
  slug: z.string().min(1).max(160),
});

/* ---------- Admin ---------- */

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  isPrimary: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
});

export const productAttributeSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  value: z.union([z.string(), z.number(), z.boolean()]),
  group: z.string().max(80).optional(),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  price: moneySchema,
  compareAtPrice: moneySchema.optional(),
  stockQuantity: z.number().int().min(0).default(0),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  images: z.array(productImageSchema).default([]),
  isActive: z.boolean().default(true),
});

export const createProductBodySchema = z.object({
  sku: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(1).max(20_000),
  shortDescription: z.string().max(500).optional(),
  brandId: objectId,
  brandName: z.string().min(1).max(160),
  categoryIds: z.array(objectId).min(1),
  primaryCategoryId: objectId,
  condition: z.enum(['new', 'refurbished', 'open_box', 'used']).default('new'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  price: moneySchema,
  compareAtPrice: moneySchema.optional(),
  costPrice: moneySchema.optional(),
  images: z.array(productImageSchema).default([]),
  attributes: z.array(productAttributeSchema).default([]),
  specifications: z.array(productAttributeSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  hasVariants: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(60)).default([]),
  weight: z.object({ value: z.number().min(0), unit: z.enum(['g', 'kg', 'oz', 'lb']) }).optional(),
  dimensions: z
    .object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
      unit: z.enum(['mm', 'cm', 'm', 'in', 'ft']),
    })
    .optional(),
  isFeatured: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
});

export const updateProductBodySchema = createProductBodySchema.partial();

export const createCategoryBodySchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  parentId: objectId.optional(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  iconName: z.string().max(80).optional(),
  image: z.object({ url: z.string().url(), alt: z.string().optional() }).optional(),
});
export const updateCategoryBodySchema = createCategoryBodySchema.partial();

export const createBrandBodySchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export const updateBrandBodySchema = createBrandBodySchema.partial();
