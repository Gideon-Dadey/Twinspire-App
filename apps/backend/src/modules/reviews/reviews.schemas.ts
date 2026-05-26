import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createReviewBodySchema = z.object({
  productId: objectId,
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(160).optional(),
  body: z.string().trim().min(10).max(6000),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().max(200).optional(),
      }),
    )
    .max(8)
    .optional(),
});

export const updateReviewBodySchema = createReviewBodySchema.partial().omit({ productId: true });

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sort: z.enum(['newest', 'oldest', 'most-helpful', 'rating-desc', 'rating-asc']).default('newest'),
});
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;

export const reviewParamsSchema = z.object({
  reviewId: objectId,
});

export const productReviewsParamsSchema = z.object({
  productId: objectId,
});

export const moderateReviewBodySchema = z.object({
  status: z.enum(['approved', 'rejected', 'flagged']),
  moderatorNote: z.string().max(480).optional(),
});

export const reportReviewBodySchema = z.object({
  reason: z.string().trim().min(3).max(240),
});
