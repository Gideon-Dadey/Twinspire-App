import { Router } from 'express';

import { env } from '../config/env';
import { buildDocsRouter } from '../docs/swagger';
import { authRouter } from '../modules/auth';
import { cartRouter } from '../modules/cart';
import { catalogRouter } from '../modules/catalog';
import { couponsRouter } from '../modules/coupons';
import { ordersRouter } from '../modules/orders';
import { paymentsRouter } from '../modules/payments';
import { reviewsRouter } from '../modules/reviews';
import { searchRouter } from '../modules/search';
import { usersRouter } from '../modules/users';
import { wishlistRouter } from '../modules/wishlist';
import { sendSuccess } from '../utils/response';

import healthRouter from './health';

const router: Router = Router();

router.use(healthRouter);

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/catalog', catalogRouter);
router.use('/reviews', reviewsRouter);
router.use('/wishlist', wishlistRouter);
router.use('/cart', cartRouter);
router.use('/coupons', couponsRouter);
router.use('/orders', ordersRouter);
router.use('/payments', paymentsRouter);
router.use('/search', searchRouter);

if (env.ENABLE_SWAGGER) {
  router.use('/docs', buildDocsRouter());
}

router.get('/', (_req, res) => {
  sendSuccess(res, {
    name: 'TwinSpire API',
    version: process.env.npm_package_version ?? '0.1.0',
    docs: env.ENABLE_SWAGGER ? `${env.API_PREFIX}/docs` : null,
    health: `${env.API_PREFIX}/health`,
  });
});

export default router;
