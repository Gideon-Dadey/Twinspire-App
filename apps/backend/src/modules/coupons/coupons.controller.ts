
import { auditService } from '../../services/audit.service';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response';
import { cartService } from '../cart';

import { couponsService } from './coupons.service';

import type { CouponListQuery } from './coupons.schemas';
import type { Request, Response } from 'express';

export const couponsController = {
  async validate(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const { code } = req.body as { code: string };
    const result = await couponsService.validateForUser(code, identity);
    sendSuccess(res, result);
  },

  /* Admin */
  async adminList(req: Request, res: Response): Promise<void> {
    const result = await couponsService.list(req.query as unknown as CouponListQuery);
    sendSuccess(res, { items: result.items }, 200, { pagination: result.meta });
  },

  async adminGet(req: Request, res: Response): Promise<void> {
    const { couponId } = req.params as { couponId: string };
    sendSuccess(res, { coupon: await couponsService.getById(couponId) });
  },

  async adminCreate(req: Request, res: Response): Promise<void> {
    const coupon = await couponsService.create(req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'create', targetType: 'Coupon', targetId: coupon.code });
    sendCreated(res, { coupon });
  },

  async adminUpdate(req: Request, res: Response): Promise<void> {
    const { couponId } = req.params as { couponId: string };
    const coupon = await couponsService.update(couponId, req.body as Record<string, unknown>);
    await auditService.fromRequest(req, { action: 'update', targetType: 'Coupon', targetId: couponId });
    sendSuccess(res, { coupon });
  },

  async adminDelete(req: Request, res: Response): Promise<void> {
    const { couponId } = req.params as { couponId: string };
    await couponsService.delete(couponId);
    await auditService.fromRequest(req, { action: 'delete', targetType: 'Coupon', targetId: couponId });
    sendNoContent(res);
  },
};
