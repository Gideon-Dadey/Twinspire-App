import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  page: z.coerce.number().int().min(1).max(200).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  sort: z.enum(['relevance', 'newest', 'price-asc', 'price-desc', 'rating', 'popular']).default('relevance'),
  category: z.string().max(120).optional(),
  brand: z
    .string()
    .trim()
    .max(240)
    .optional()
    .transform((v) => (v ? v.split(',').slice(0, 20) : undefined)),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const suggestQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(10).default(8),
});
