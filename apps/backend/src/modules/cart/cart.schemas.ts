import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const addCartItemBodySchema = z.object({
  productId: objectId,
  variantId: objectId.optional(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const updateCartItemBodySchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

export const cartItemParamsSchema = z.object({
  itemId: objectId,
});

export const applyCouponBodySchema = z.object({
  code: z.string().trim().min(2).max(48),
});

export const removeCouponParamsSchema = z.object({
  code: z.string().trim().min(2).max(48),
});
