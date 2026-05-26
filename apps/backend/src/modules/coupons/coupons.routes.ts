import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';

import { couponsController } from './coupons.controller';
import {
  couponListQuerySchema,
  couponParamsSchema,
  createCouponBodySchema,
  updateCouponBodySchema,
  validateCouponBodySchema,
} from './coupons.schemas';

const router: Router = Router();

router.post(
  '/validate',
  optionalAuthenticate,
  validate({ body: validateCouponBodySchema }),
  asyncHandler(couponsController.validate),
);

router.get(
  '/admin',
  authenticate,
  requireRole('manager'),
  validate({ query: couponListQuerySchema }),
  asyncHandler(couponsController.adminList),
);
router.get(
  '/admin/:couponId',
  authenticate,
  requireRole('manager'),
  validate({ params: couponParamsSchema }),
  asyncHandler(couponsController.adminGet),
);
router.post(
  '/admin',
  authenticate,
  requireRole('manager'),
  validate({ body: createCouponBodySchema }),
  asyncHandler(couponsController.adminCreate),
);
router.patch(
  '/admin/:couponId',
  authenticate,
  requireRole('manager'),
  validate({ params: couponParamsSchema, body: updateCouponBodySchema }),
  asyncHandler(couponsController.adminUpdate),
);
router.delete(
  '/admin/:couponId',
  authenticate,
  requireRole('admin'),
  validate({ params: couponParamsSchema }),
  asyncHandler(couponsController.adminDelete),
);

export default router;
