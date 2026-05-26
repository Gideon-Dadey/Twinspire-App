
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { Payment } from '../../models/payment.model';
import { HttpError } from '../../utils/http-error';
import { sendSuccess } from '../../utils/response';

import { paymentsService } from './payments.service';

import type { Request, Response } from 'express';

export const paymentsController = {
  async publishableKey(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      stripe: env.STRIPE_SECRET_KEY ? { configured: true } : { configured: false },
      paypal: env.PAYPAL_CLIENT_ID
        ? { configured: true, env: env.PAYPAL_ENV, clientId: env.PAYPAL_CLIENT_ID }
        : { configured: false },
    });
  },

  async getPayment(req: Request, res: Response): Promise<void> {
    if (!req.auth) throw HttpError.unauthorized();
    const { paymentId } = req.params as { paymentId: string };
    const payment = await Payment.findOne({ _id: paymentId, userId: req.auth.userId }).lean();
    if (!payment) throw HttpError.notFound('Payment not found');
    sendSuccess(res, { payment });
  },

  async stripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      throw HttpError.badRequest('Missing Stripe signature');
    }
    const raw = req.body as Buffer;
    try {
      await paymentsService.handleStripeWebhook(raw, signature);
      res.status(200).json({ received: true });
    } catch (err) {
      logger.warn({ err }, 'Stripe webhook handling failed');
      throw err;
    }
  },

  async paypalWebhook(req: Request, res: Response): Promise<void> {
    const headers = req.headers as Record<string, string>;
    await paymentsService.handlePaypalWebhook(req.body, headers);
    res.status(200).json({ received: true });
  },
};
