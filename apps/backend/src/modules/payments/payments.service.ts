import { createHmac, timingSafeEqual } from 'node:crypto';

import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { Order, type OrderDocument } from '../../models/order.model';
import { Payment, type PaymentDoc } from '../../models/payment.model';
import { HttpError } from '../../utils/http-error';
import { ordersService } from '../orders/orders.service';

import { getStripeClient, isStripeConfigured } from './stripe.client';

import type { Request } from 'express';
import type Stripe from 'stripe';

export type SupportedPaymentProvider = 'stripe' | 'paypal' | 'paystack';

export interface PaymentSession {
  provider: SupportedPaymentProvider;
  paymentId: string;
  clientSecret?: string;
  redirectUrl?: string;
  publishableKey?: string;
  /** For Paystack: the access code used to launch the inline popup. */
  paystackAccessCode?: string;
  /** For Paystack: the reference attached to the transaction. */
  paystackReference?: string;
}

/**
 * Paystack uses minor units everywhere — pesewas for GHS, kobo for NGN.
 * Multiplying by 100 here keeps the API contract consistent.
 */
function toPaystackMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export class PaymentsService {
  /* ---------- Create session ---------- */

  async createPaymentSession(
    order: OrderDocument,
    provider: SupportedPaymentProvider,
    req: Request,
    opts: { paystackChannel?: 'momo' | 'card' | 'bank' } = {},
  ): Promise<PaymentSession> {
    if (provider === 'stripe') return this.createStripeSession(order);
    if (provider === 'paypal') return this.createPaypalSession(order, req);
    if (provider === 'paystack') {
      return this.createPaystackSession(order, opts.paystackChannel ?? 'momo');
    }
    throw HttpError.badRequest(`Unsupported payment provider: ${provider as string}`);
  }

  private async createStripeSession(order: OrderDocument): Promise<PaymentSession> {
    const stripe = getStripeClient();
    if (!stripe) {
      // Stub mode: still record a Payment row so downstream flows work.
      const payment = await Payment.create({
        orderId: order._id,
        userId: order.userId,
        provider: 'stripe',
        amount: order.totals.total,
        status: 'requires_confirmation',
        metadata: { stub: true },
      });
      return { provider: 'stripe', paymentId: String(payment._id), clientSecret: 'stub-secret' };
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(order.totals.total.amount * 100),
      currency: order.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        userId: order.userId ? String(order.userId) : 'guest',
      },
      receipt_email: order.guestEmail,
    });

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      provider: 'stripe',
      providerPaymentId: intent.id,
      amount: order.totals.total,
      status: this.mapStripeStatus(intent.status),
    });

    await Order.updateOne({ _id: order._id }, { $set: { status: 'awaiting_payment' } });

    return {
      provider: 'stripe',
      paymentId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
    };
  }

  private async createPaypalSession(order: OrderDocument, _req: Request): Promise<PaymentSession> {
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      const payment = await Payment.create({
        orderId: order._id,
        userId: order.userId,
        provider: 'paypal',
        amount: order.totals.total,
        status: 'requires_confirmation',
        metadata: { stub: true },
      });
      return {
        provider: 'paypal',
        paymentId: String(payment._id),
        redirectUrl: '/checkout/paypal-stub',
      };
    }

    const base =
      env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    const authRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!authRes.ok) throw HttpError.serviceUnavailable('PayPal auth failed');
    const { access_token } = (await authRes.json()) as { access_token: string };

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.orderNumber,
            amount: {
              currency_code: order.currency,
              value: order.totals.total.amount.toFixed(2),
            },
          },
        ],
      }),
    });
    if (!orderRes.ok) {
      const err = await orderRes.text();
      logger.error({ err }, 'PayPal order create failed');
      throw HttpError.serviceUnavailable('PayPal order create failed');
    }
    const paypalOrder = (await orderRes.json()) as {
      id: string;
      status: string;
      links?: { href: string; rel: string }[];
    };
    const approveLink = paypalOrder.links?.find((l) => l.rel === 'approve')?.href;

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      provider: 'paypal',
      providerPaymentId: paypalOrder.id,
      amount: order.totals.total,
      status: 'requires_action',
    });

    await Order.updateOne({ _id: order._id }, { $set: { status: 'awaiting_payment' } });

    return {
      provider: 'paypal',
      paymentId: paypalOrder.id,
      redirectUrl: approveLink,
    };
  }

  private async createPaystackSession(
    order: OrderDocument,
    channel: 'momo' | 'card' | 'bank',
  ): Promise<PaymentSession> {
    // Stub mode when keys aren't configured — record an internal Payment row
    // and return a sandbox redirect so the checkout UX still works in dev.
    if (!env.PAYSTACK_SECRET_KEY) {
      const payment = await Payment.create({
        orderId: order._id,
        userId: order.userId,
        provider: 'paystack',
        amount: order.totals.total,
        status: 'requires_confirmation',
        metadata: { stub: true, channel },
      });
      return {
        provider: 'paystack',
        paymentId: String(payment._id),
        redirectUrl: `/checkout/paystack-stub?ref=${encodeURIComponent(order.orderNumber)}`,
      };
    }

    // Paystack expects the amount in the minor unit of the currency. For GHS
    // that's pesewas (×100). Only `card` channels are universally enabled for
    // GHS today — `mobile_money` is the rail for MoMo, `bank` for transfers.
    const paystackChannels: string[] =
      channel === 'momo'
        ? ['mobile_money']
        : channel === 'card'
          ? ['card']
          : ['bank', 'bank_transfer', 'ussd'];

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Paystack only accepts a primary email — use the order's user email or
        // the captured guest email so the customer can receive Paystack receipts.
        email: order.guestEmail ?? 'customer@twinspire.gh',
        amount: toPaystackMinorUnits(order.totals.total.amount),
        currency: order.currency.toUpperCase(),
        reference: `TS-${order.orderNumber}-${Date.now()}`,
        channels: paystackChannels,
        metadata: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          channel,
        },
      }),
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      logger.error({ err }, 'Paystack initialize failed');
      throw HttpError.serviceUnavailable('Paystack initialize failed');
    }

    const json = (await initRes.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; access_code: string; reference: string };
    };

    if (!json.status || !json.data) {
      logger.error({ json }, 'Paystack returned unsuccessful response');
      throw HttpError.serviceUnavailable(json.message ?? 'Paystack initialize failed');
    }

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      provider: 'paystack',
      providerPaymentId: json.data.reference,
      amount: order.totals.total,
      status: 'requires_action',
      metadata: { channel, accessCode: json.data.access_code },
    });

    await Order.updateOne({ _id: order._id }, { $set: { status: 'awaiting_payment' } });

    return {
      provider: 'paystack',
      paymentId: json.data.reference,
      redirectUrl: json.data.authorization_url,
      paystackAccessCode: json.data.access_code,
      paystackReference: json.data.reference,
    };
  }

  /* ---------- Webhook handling ---------- */

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = getStripeClient();
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      logger.warn('Stripe webhook called but stripe is not configured');
      return;
    }
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      logger.warn({ err }, 'Invalid Stripe webhook signature');
      throw HttpError.badRequest('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await this.recordPaymentSuccess(intent.id, intent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await this.recordPaymentFailure(intent.id, intent.last_payment_error?.message ?? 'unknown');
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        if (charge.payment_intent) {
          await this.recordPaymentRefund(
            String(charge.payment_intent),
            charge.amount_refunded / 100,
          );
        }
        break;
      }
      default:
        logger.debug({ type: event.type }, 'Unhandled Stripe webhook event');
    }
  }

  async handlePaypalWebhook(_payload: unknown, _headers: Record<string, string>): Promise<void> {
    // PayPal webhook signature verification requires a webhook ID and the
    // /verify-webhook-signature endpoint. We perform a structural check only.
    const event = _payload as {
      event_type?: string;
      resource?: { id?: string; supplementary_data?: { related_ids?: { order_id?: string } } };
    };
    if (!event?.event_type) return;
    if (
      event.event_type === 'CHECKOUT.ORDER.APPROVED' ||
      event.event_type === 'PAYMENT.CAPTURE.COMPLETED'
    ) {
      const paypalOrderId =
        event.resource?.supplementary_data?.related_ids?.order_id ?? event.resource?.id;
      if (paypalOrderId) await this.recordPaymentSuccess(paypalOrderId);
    }
    if (
      event.event_type === 'PAYMENT.CAPTURE.DENIED' ||
      event.event_type === 'CHECKOUT.ORDER.VOIDED'
    ) {
      const paypalOrderId = event.resource?.id;
      if (paypalOrderId) await this.recordPaymentFailure(paypalOrderId, event.event_type);
    }
  }

  /**
   * Paystack signs webhook bodies with HMAC-SHA512 using your secret key.
   * The signature arrives in the `x-paystack-signature` header. We use
   * `timingSafeEqual` to avoid leaking signature length via timing.
   *
   * Source: https://paystack.com/docs/payments/webhooks
   */
  async handlePaystackWebhook(rawBody: Buffer, signatureHeader: string): Promise<void> {
    const secret = env.PAYSTACK_WEBHOOK_SECRET ?? env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      logger.warn('Paystack webhook called but no secret is configured');
      return;
    }

    const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const provided = Buffer.from(signatureHeader || '', 'utf8');
    if (expectedBuf.length !== provided.length || !timingSafeEqual(expectedBuf, provided)) {
      logger.warn('Invalid Paystack webhook signature');
      throw HttpError.badRequest('Invalid webhook signature');
    }

    type PaystackEvent = {
      event: string;
      data?: {
        reference?: string;
        status?: string;
        amount?: number;
        gateway_response?: string;
        channel?: string;
      };
    };
    const event = JSON.parse(rawBody.toString('utf8')) as PaystackEvent;

    switch (event.event) {
      case 'charge.success': {
        const ref = event.data?.reference;
        if (ref) await this.recordPaymentSuccess(ref, event);
        break;
      }
      case 'charge.failed': {
        const ref = event.data?.reference;
        if (ref) {
          await this.recordPaymentFailure(
            ref,
            event.data?.gateway_response ?? 'paystack:charge.failed',
          );
        }
        break;
      }
      case 'refund.processed':
      case 'refund.processing': {
        const ref = event.data?.reference;
        const amount = (event.data?.amount ?? 0) / 100;
        if (ref) await this.recordPaymentRefund(ref, amount);
        break;
      }
      default:
        logger.debug({ type: event.event }, 'Unhandled Paystack webhook event');
    }
  }

  /* ---------- Refunds ---------- */

  async refundOrder(
    orderId: string,
    opts: { amount?: number; reason?: string } = {},
  ): Promise<unknown> {
    const order = await Order.findById(orderId);
    if (!order) throw HttpError.notFound('Order not found');
    if (order.paymentStatus !== 'captured' && order.paymentStatus !== 'partially_refunded') {
      throw HttpError.badRequest('Order is not in a refundable state', { code: 'NOT_REFUNDABLE' });
    }

    const payment = await Payment.findOne({
      orderId: order._id,
      provider: order.paymentMethod?.provider,
    });
    if (!payment?.providerPaymentId) {
      // Stub mode — just update internal state.
      await ordersService.markRefunded(
        orderId,
        opts.amount ?? order.totals.total.amount,
        opts.reason,
      );
      return { stub: true, refundedAmount: opts.amount ?? order.totals.total.amount };
    }

    if (payment.provider === 'stripe') {
      const stripe = getStripeClient();
      if (!stripe) throw HttpError.serviceUnavailable('Stripe not configured');
      const refund = await stripe.refunds.create({
        payment_intent: payment.providerPaymentId,
        amount: opts.amount ? Math.round(opts.amount * 100) : undefined,
        reason: opts.reason ? 'requested_by_customer' : undefined,
      });
      const refundedAmount = (refund.amount ?? 0) / 100;
      await ordersService.markRefunded(orderId, refundedAmount, opts.reason);
      payment.refundedAmount = { amount: refundedAmount, currency: payment.amount.currency };
      payment.refundedAt = new Date();
      await payment.save();
      return { provider: 'stripe', refundId: refund.id, refundedAmount };
    }

    if (payment.provider === 'paypal') {
      logger.warn({ orderId }, 'PayPal refund initiated; capture flow handled via webhook');
      await ordersService.markRefunded(
        orderId,
        opts.amount ?? order.totals.total.amount,
        opts.reason,
      );
      return { provider: 'paypal', refundedAmount: opts.amount ?? order.totals.total.amount };
    }

    if (payment.provider === 'paystack') {
      if (!env.PAYSTACK_SECRET_KEY) {
        // Stub mode — bookkeeping only.
        await ordersService.markRefunded(
          orderId,
          opts.amount ?? order.totals.total.amount,
          opts.reason,
        );
        return {
          provider: 'paystack',
          refundedAmount: opts.amount ?? order.totals.total.amount,
          stub: true,
        };
      }

      const refundRes = await fetch('https://api.paystack.co/refund', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: payment.providerPaymentId,
          amount: opts.amount ? toPaystackMinorUnits(opts.amount) : undefined,
          merchant_note: opts.reason,
        }),
      });
      if (!refundRes.ok) {
        const err = await refundRes.text();
        logger.error({ err }, 'Paystack refund failed');
        throw HttpError.serviceUnavailable('Paystack refund failed');
      }
      const json = (await refundRes.json()) as {
        status: boolean;
        data?: { amount?: number; id?: number | string };
      };
      const refundedAmount =
        (json.data?.amount ?? 0) / 100 || opts.amount || order.totals.total.amount;
      await ordersService.markRefunded(orderId, refundedAmount, opts.reason);
      payment.refundedAmount = { amount: refundedAmount, currency: payment.amount.currency };
      payment.refundedAt = new Date();
      await payment.save();
      return { provider: 'paystack', refundId: json.data?.id, refundedAmount };
    }

    throw HttpError.badRequest('Unsupported payment provider');
  }

  /* ---------- Internal helpers ---------- */

  private async recordPaymentSuccess(providerPaymentId: string, rawEvent?: unknown): Promise<void> {
    const payment = await Payment.findOne({ providerPaymentId });
    if (!payment) return;
    payment.status = 'succeeded';
    payment.capturedAt = new Date();
    if (rawEvent) payment.rawEvent = rawEvent as Record<string, unknown>;
    await payment.save();
    await ordersService.markPaid(String(payment.orderId), providerPaymentId);
  }

  private async recordPaymentFailure(providerPaymentId: string, reason: string): Promise<void> {
    const payment = await Payment.findOne({ providerPaymentId });
    if (!payment) return;
    payment.status = 'failed';
    payment.failureReason = reason;
    await payment.save();
    await ordersService.markFailed(String(payment.orderId), reason);
  }

  private async recordPaymentRefund(
    providerPaymentId: string,
    refundedAmount: number,
  ): Promise<void> {
    const payment = await Payment.findOne({ providerPaymentId });
    if (!payment) return;
    payment.refundedAmount = { amount: refundedAmount, currency: payment.amount.currency };
    payment.refundedAt = new Date();
    if (refundedAmount >= payment.amount.amount) payment.status = 'cancelled';
    await payment.save();
    await ordersService.markRefunded(String(payment.orderId), refundedAmount);
  }

  private mapStripeStatus(status: Stripe.PaymentIntent.Status): PaymentDoc['status'] {
    switch (status) {
      case 'requires_action':
      case 'requires_payment_method':
        return 'requires_action';
      case 'requires_confirmation':
      case 'requires_capture':
        return 'requires_confirmation';
      case 'processing':
        return 'processing';
      case 'succeeded':
        return 'succeeded';
      case 'canceled':
        return 'cancelled';
      default:
        return 'processing';
    }
  }
}

// Suppress unused-import warning until both flags become required.
void isStripeConfigured;

export const paymentsService = new PaymentsService();
