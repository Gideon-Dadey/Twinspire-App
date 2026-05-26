import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const addWishlistItemBodySchema = z.object({
  productId: objectId,
  variantId: objectId.optional(),
  priceAlertThreshold: z.number().min(0).optional(),
});

export const removeWishlistItemParamsSchema = z.object({
  productId: objectId,
});

export const wishlistListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const recentlyViewedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const trackViewBodySchema = z.object({
  productId: objectId,
});
