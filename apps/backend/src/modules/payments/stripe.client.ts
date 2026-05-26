import Stripe from 'stripe';

import { env } from '../../config/env';
import { logger } from '../../config/logger';

let client: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (client) return client;
  if (!env.STRIPE_SECRET_KEY) {
    logger.warn('Stripe secret key not configured — Stripe will operate in stub mode');
    return null;
  }
  client = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
    typescript: true,
    appInfo: { name: 'TwinSpire', version: '1.0.0' },
  });
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}
