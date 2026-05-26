
import { auditService } from '../../services/audit.service';
import { HttpError } from '../../utils/http-error';
import { sendCreated, sendNoContent, sendSuccess } from '../../utils/response';

import { reviewsService } from './reviews.service';

import type { ReviewListQuery } from './reviews.schemas';
import type { Request, Response } from 'express';

function requireAuthUserId(req: Request): string {
  if (!req.auth) throw HttpError.unauthorized();
  return req.auth.userId;
}

export const reviewsController = {
  /* Public list for a product */
  async listForProduct(req: Request, res: Response): Promise<void> {
    const { productId } = req.params as { productId: string };
    const query = req.query as unknown as ReviewListQuery;
    const result = await reviewsService.listForProduct(productId, query);
    sendSuccess(res, { items: result.items, summary: result.summary }, 200, { pagination: result.meta });
  },

  async create(req: Request, res: Response): Promise<void> {
    const userId = requireAuthUserId(req);
    const review = await reviewsService.create(userId, req.body as Parameters<typeof reviewsService.create>[1]);
    sendCreated(res, { review });
  },

  async update(req: Request, res: Response): Promise<void> {
    const userId = requireAuthUserId(req);
    const { reviewId } = req.params as { reviewId: string };
    const review = await reviewsService.update(userId, reviewId, req.body as Parameters<typeof reviewsService.update>[2]);
    sendSuccess(res, { review });
  },

  async delete(req: Request, res: Response): Promise<void> {
    const userId = requireAuthUserId(req);
    const { reviewId } = req.params as { reviewId: string };
    await reviewsService.delete(userId, reviewId);
    sendNoContent(res);
  },

  async markHelpful(req: Request, res: Response): Promise<void> {
    requireAuthUserId(req);
    const { reviewId } = req.params as { reviewId: string };
    const review = await reviewsService.markHelpful(reviewId, true);
    sendSuccess(res, { review });
  },

  async markNotHelpful(req: Request, res: Response): Promise<void> {
    requireAuthUserId(req);
    const { reviewId } = req.params as { reviewId: string };
    const review = await reviewsService.markHelpful(reviewId, false);
    sendSuccess(res, { review });
  },

  async report(req: Request, res: Response): Promise<void> {
    requireAuthUserId(req);
    const { reviewId } = req.params as { reviewId: string };
    const { reason } = req.body as { reason: string };
    await reviewsService.report(reviewId, reason);
    sendNoContent(res);
  },

  /* Admin */
  async adminList(req: Request, res: Response): Promise<void> {
    const result = await reviewsService.adminList(req.query as unknown as ReviewListQuery);
    sendSuccess(res, { items: result.items }, 200, { pagination: result.meta });
  },

  async moderate(req: Request, res: Response): Promise<void> {
    const { reviewId } = req.params as { reviewId: string };
    const review = await reviewsService.moderate(
      reviewId,
      req.body as Parameters<typeof reviewsService.moderate>[1],
    );
    await auditService.fromRequest(req, {
      action: 'update',
      targetType: 'Review',
      targetId: reviewId,
      metadata: { status: review.status },
    });
    sendSuccess(res, { review });
  },
};
