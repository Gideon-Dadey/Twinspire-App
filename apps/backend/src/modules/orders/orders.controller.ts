
import { auditService } from '../../services/audit.service';
import { HttpError } from '../../utils/http-error';
import { sendCreated, sendSuccess } from '../../utils/response';
import { cartService } from '../cart';
import { paymentsService } from '../payments/payments.service';

import { ordersService } from './orders.service';

import type { OrderListQuery } from './orders.schemas';
import type { Request, Response } from 'express';

function requireUserId(req: Request): string {
  if (!req.auth) throw HttpError.unauthorized();
  return req.auth.userId;
}

export const ordersController = {
  /* User-facing */

  async quote(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const body = req.body as { couponCodes?: string[]; shippingAddress?: { countryCode?: string } };
    const result = await ordersService.quote(identity, {
      couponCodes: body.couponCodes,
      country: body.shippingAddress?.countryCode,
    });
    sendSuccess(res, { quote: result });
  },

  async placeOrder(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const body = req.body as Parameters<typeof ordersService.placeOrder>[1];
    const orderDoc = await ordersService.placeOrder(identity, body);

    // Initiate payment session (Stripe or PayPal)
    const paymentSession = await paymentsService.createPaymentSession(orderDoc, body.paymentProvider, req);

    sendCreated(res, { order: orderDoc.toJSON(), paymentSession });
  },

  async listMine(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const result = await ordersService.listForUser(userId, req.query as unknown as OrderListQuery);
    sendSuccess(res, { items: result.items }, 200, { pagination: result.meta });
  },

  async getMine(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const { orderId } = req.params as { orderId: string };
    sendSuccess(res, { order: await ordersService.getForUser(userId, orderId) });
  },

  async cancelMine(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const { orderId } = req.params as { orderId: string };
    const order = await ordersService.cancelByUser(userId, orderId);
    sendSuccess(res, { order });
  },

  /* Admin */

  async adminList(req: Request, res: Response): Promise<void> {
    const result = await ordersService.adminList(req.query as unknown as OrderListQuery);
    sendSuccess(res, { items: result.items }, 200, { pagination: result.meta });
  },

  async adminGet(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params as { orderId: string };
    sendSuccess(res, { order: await ordersService.adminGet(orderId) });
  },

  async adminUpdate(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const { orderId } = req.params as { orderId: string };
    const order = await ordersService.adminUpdate(
      orderId,
      userId,
      req.body as Parameters<typeof ordersService.adminUpdate>[2],
    );
    await auditService.fromRequest(req, { action: 'update', targetType: 'Order', targetId: orderId });
    sendSuccess(res, { order });
  },

  async adminRefund(req: Request, res: Response): Promise<void> {
    const { orderId } = req.params as { orderId: string };
    const { amount, reason } = req.body as { amount?: number; reason?: string };
    const refund = await paymentsService.refundOrder(orderId, { amount, reason });
    await auditService.fromRequest(req, {
      action: 'refund',
      targetType: 'Order',
      targetId: orderId,
      metadata: { amount, reason },
    });
    sendSuccess(res, { refund });
  },
};
