import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { sensitiveRateLimiter } from '../../middleware/rate-limit';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';

import { ordersController } from './orders.controller';
import {
  adminUpdateOrderBodySchema,
  checkoutQuoteBodySchema,
  orderListQuerySchema,
  orderParamsSchema,
  placeOrderBodySchema,
  refundOrderBodySchema,
} from './orders.schemas';

const router: Router = Router();

router.post(
  '/quote',
  optionalAuthenticate,
  validate({ body: checkoutQuoteBodySchema }),
  asyncHandler(ordersController.quote),
);

router.post(
  '/',
  optionalAuthenticate,
  sensitiveRateLimiter,
  validate({ body: placeOrderBodySchema }),
  asyncHandler(ordersController.placeOrder),
);

router.get(
  '/',
  authenticate,
  validate({ query: orderListQuerySchema }),
  asyncHandler(ordersController.listMine),
);
router.get(
  '/:orderId',
  authenticate,
  validate({ params: orderParamsSchema }),
  asyncHandler(ordersController.getMine),
);
router.post(
  '/:orderId/cancel',
  authenticate,
  validate({ params: orderParamsSchema }),
  asyncHandler(ordersController.cancelMine),
);

/* Admin */
router.get(
  '/admin/all',
  authenticate,
  requireRole('manager'),
  validate({ query: orderListQuerySchema }),
  asyncHandler(ordersController.adminList),
);
router.get(
  '/admin/all/:orderId',
  authenticate,
  requireRole('manager'),
  validate({ params: orderParamsSchema }),
  asyncHandler(ordersController.adminGet),
);
router.patch(
  '/admin/all/:orderId',
  authenticate,
  requireRole('manager'),
  validate({ params: orderParamsSchema, body: adminUpdateOrderBodySchema }),
  asyncHandler(ordersController.adminUpdate),
);
router.post(
  '/admin/all/:orderId/refund',
  authenticate,
  requireRole('admin'),
  validate({ params: orderParamsSchema, body: refundOrderBodySchema }),
  asyncHandler(ordersController.adminRefund),
);

export default router;
