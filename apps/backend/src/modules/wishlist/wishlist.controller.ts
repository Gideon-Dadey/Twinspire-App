
import { HttpError } from '../../utils/http-error';
import { sendNoContent, sendSuccess } from '../../utils/response';

import { wishlistService } from './wishlist.service';

import type { Request, Response } from 'express';

function requireUserId(req: Request): string {
  if (!req.auth) throw HttpError.unauthorized();
  return req.auth.userId;
}

export const wishlistController = {
  async getWishlist(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await wishlistService.list(userId, { page, limit });
    sendSuccess(
      res,
      { wishlist: result.wishlist, items: result.products },
      200,
      { pagination: result.pagination },
    );
  },

  async addItem(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const wishlist = await wishlistService.addItem(userId, req.body as Parameters<typeof wishlistService.addItem>[1]);
    sendSuccess(res, { wishlist }, 201);
  },

  async removeItem(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const { productId } = req.params as { productId: string };
    const wishlist = await wishlistService.removeItem(userId, productId);
    sendSuccess(res, { wishlist });
  },

  async clear(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    await wishlistService.clear(userId);
    sendNoContent(res);
  },

  async recentlyViewed(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const limit = Number(req.query.limit ?? 20);
    const items = await wishlistService.recentlyViewed(userId, limit);
    sendSuccess(res, { items });
  },

  async trackView(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    const { productId } = req.body as { productId: string };
    await wishlistService.trackView(userId, productId);
    sendNoContent(res);
  },

  async clearRecentlyViewed(req: Request, res: Response): Promise<void> {
    const userId = requireUserId(req);
    await wishlistService.clearRecentlyViewed(userId);
    sendNoContent(res);
  },
};
