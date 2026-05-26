
import { sendSuccess } from '../../utils/response';

import { cartService } from './cart.service';

import type { Request, Response } from 'express';

export const cartController = {
  async getCart(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const cart = await cartService.get(identity);
    sendSuccess(res, { cart });
  },

  async addItem(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const cart = await cartService.addItem(identity, req.body as Parameters<typeof cartService.addItem>[1]);
    sendSuccess(res, { cart }, 201);
  },

  async updateItem(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const { itemId } = req.params as { itemId: string };
    const { quantity } = req.body as { quantity: number };
    const cart = await cartService.updateItem(identity, itemId, quantity);
    sendSuccess(res, { cart });
  },

  async removeItem(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const { itemId } = req.params as { itemId: string };
    const cart = await cartService.removeItem(identity, itemId);
    sendSuccess(res, { cart });
  },

  async clear(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const cart = await cartService.clear(identity);
    sendSuccess(res, { cart });
  },

  async applyCoupon(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const { code } = req.body as { code: string };
    const cart = await cartService.applyCoupon(identity, code);
    sendSuccess(res, { cart });
  },

  async removeCoupon(req: Request, res: Response): Promise<void> {
    const identity = cartService.resolveIdentity(req, res);
    const { code } = req.params as { code: string };
    const cart = await cartService.removeCoupon(identity, code);
    sendSuccess(res, { cart });
  },
};
