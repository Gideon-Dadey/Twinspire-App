import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';

import { wishlistController } from './wishlist.controller';
import {
  addWishlistItemBodySchema,
  recentlyViewedQuerySchema,
  removeWishlistItemParamsSchema,
  trackViewBodySchema,
  wishlistListQuerySchema,
} from './wishlist.schemas';

const router: Router = Router();

router.use(authenticate);

router.get('/', validate({ query: wishlistListQuerySchema }), asyncHandler(wishlistController.getWishlist));
router.post('/items', validate({ body: addWishlistItemBodySchema }), asyncHandler(wishlistController.addItem));
router.delete(
  '/items/:productId',
  validate({ params: removeWishlistItemParamsSchema }),
  asyncHandler(wishlistController.removeItem),
);
router.delete('/', asyncHandler(wishlistController.clear));

router.get(
  '/recently-viewed',
  validate({ query: recentlyViewedQuerySchema }),
  asyncHandler(wishlistController.recentlyViewed),
);
router.post(
  '/recently-viewed/track',
  validate({ body: trackViewBodySchema }),
  asyncHandler(wishlistController.trackView),
);
router.delete('/recently-viewed', asyncHandler(wishlistController.clearRecentlyViewed));

export default router;
