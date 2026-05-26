import { SUPPORTED_CURRENCIES } from '@twinspire/utils';
import { z } from 'zod';


const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
const moneyShape = z.object({ amount: z.number().min(0), currency: z.enum(SUPPORTED_CURRENCIES) });

export const validateCouponBodySchema = z.object({
  code: z.string().trim().min(2).max(48),
});

export const createCouponBodySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[A-Za-z0-9_-]+$/),
  description: z.string().max(480).optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'bogo']),
  value: z.number().min(0),
  currency: z.string().length(3).optional(),
  minSubtotal: moneyShape.optional(),
  maxDiscount: moneyShape.optional(),
  usageLimit: z.number().int().min(1).optional(),
  usageLimitPerUser: z.number().int().min(1).optional(),
  applicableCategoryIds: z.array(objectId).optional(),
  applicableBrandIds: z.array(objectId).optional(),
  applicableProductIds: z.array(objectId).optional(),
  excludedProductIds: z.array(objectId).optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
  campaignId: objectId.nullable().optional(),
  stackable: z.boolean().default(false),
  firstOrderOnly: z.boolean().default(false),
});

export const updateCouponBodySchema = createCouponBodySchema.partial();

export const couponParamsSchema = z.object({
  couponId: objectId,
});

export const couponListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === true || v === 'true')),
  q: z.string().trim().max(48).optional(),
});
export type CouponListQuery = z.infer<typeof couponListQuerySchema>;
