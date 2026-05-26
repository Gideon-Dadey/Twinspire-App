import express, { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';

import { paymentsController } from './payments.controller';
import { getPaymentParamsSchema } from './payments.schemas';

const router: Router = Router();

router.get('/config', asyncHandler(paymentsController.publishableKey));
router.get(
  '/:paymentId',
  authenticate,
  validate({ params: getPaymentParamsSchema }),
  asyncHandler(paymentsController.getPayment),
);

/**
 * Webhook routes use express.raw so signature verification (Stripe) can be
 * performed against the exact bytes received. These routes are mounted at
 * `/webhooks/*` in the main router to bypass json/cookie middleware.
 */
export const stripeWebhookRouter: Router = Router();
stripeWebhookRouter.post(
  '/stripe',
  express.raw({ type: 'application/json', limit: '2mb' }),
  asyncHandler(paymentsController.stripeWebhook),
);

export const paypalWebhookRouter: Router = Router();
paypalWebhookRouter.post(
  '/paypal',
  express.json({ limit: '2mb' }),
  asyncHandler(paymentsController.paypalWebhook),
);

/**
 * Paystack signs the raw request body with HMAC-SHA512. We need express.raw
 * here so the verification HMAC matches byte-for-byte; json middleware would
 * re-serialize and break the signature.
 */
export const paystackWebhookRouter: Router = Router();
paystackWebhookRouter.post(
  '/paystack',
  express.raw({ type: 'application/json', limit: '2mb' }),
  asyncHandler(paymentsController.paystackWebhook),
);

export default router;
