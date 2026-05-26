import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { optionalAuthenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';

import { cartController } from './cart.controller';
import {
  addCartItemBodySchema,
  applyCouponBodySchema,
  cartItemParamsSchema,
  removeCouponParamsSchema,
  updateCartItemBodySchema,
} from './cart.schemas';

const router: Router = Router();

router.use(optionalAuthenticate);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', validate({ body: addCartItemBodySchema }), asyncHandler(cartController.addItem));
router.patch(
  '/items/:itemId',
  validate({ params: cartItemParamsSchema, body: updateCartItemBodySchema }),
  asyncHandler(cartController.updateItem),
);
router.delete(
  '/items/:itemId',
  validate({ params: cartItemParamsSchema }),
  asyncHandler(cartController.removeItem),
);
router.delete('/', asyncHandler(cartController.clear));
router.post(
  '/coupons',
  validate({ body: applyCouponBodySchema }),
  asyncHandler(cartController.applyCoupon),
);
router.delete(
  '/coupons/:code',
  validate({ params: removeCouponParamsSchema }),
  asyncHandler(cartController.removeCoupon),
);

export default router;
