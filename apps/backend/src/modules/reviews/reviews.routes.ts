import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';

import { reviewsController } from './reviews.controller';
import {
  createReviewBodySchema,
  moderateReviewBodySchema,
  productReviewsParamsSchema,
  reportReviewBodySchema,
  reviewListQuerySchema,
  reviewParamsSchema,
  updateReviewBodySchema,
} from './reviews.schemas';

const router: Router = Router();

router.get(
  '/products/:productId',
  validate({ params: productReviewsParamsSchema, query: reviewListQuerySchema }),
  asyncHandler(reviewsController.listForProduct),
);

router.post(
  '/',
  authenticate,
  validate({ body: createReviewBodySchema }),
  asyncHandler(reviewsController.create),
);

router.patch(
  '/:reviewId',
  authenticate,
  validate({ params: reviewParamsSchema, body: updateReviewBodySchema }),
  asyncHandler(reviewsController.update),
);

router.delete(
  '/:reviewId',
  authenticate,
  validate({ params: reviewParamsSchema }),
  asyncHandler(reviewsController.delete),
);

router.post(
  '/:reviewId/helpful',
  authenticate,
  validate({ params: reviewParamsSchema }),
  asyncHandler(reviewsController.markHelpful),
);

router.post(
  '/:reviewId/not-helpful',
  authenticate,
  validate({ params: reviewParamsSchema }),
  asyncHandler(reviewsController.markNotHelpful),
);

router.post(
  '/:reviewId/report',
  authenticate,
  validate({ params: reviewParamsSchema, body: reportReviewBodySchema }),
  asyncHandler(reviewsController.report),
);

router.get(
  '/admin',
  authenticate,
  requireRole('support'),
  validate({ query: reviewListQuerySchema }),
  asyncHandler(reviewsController.adminList),
);

router.post(
  '/admin/:reviewId/moderate',
  authenticate,
  requireRole('support'),
  validate({ params: reviewParamsSchema, body: moderateReviewBodySchema }),
  asyncHandler(reviewsController.moderate),
);

export default router;
