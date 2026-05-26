
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { Review, type ReviewDoc } from '../../models/review.model';
import { User } from '../../models/user.model';
import { productRepository } from '../../repositories/product.repository';
import { reviewRepository } from '../../repositories/review.repository';
import { HttpError } from '../../utils/http-error';

import type { ReviewListQuery } from './reviews.schemas';
import type { SortOrder } from 'mongoose';

const SORT_MAP: Record<ReviewListQuery['sort'], Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'most-helpful': { helpfulCount: -1, createdAt: -1 },
  'rating-desc': { rating: -1, createdAt: -1 },
  'rating-asc': { rating: 1, createdAt: -1 },
};

export class ReviewsService {
  /* ---------- Public listing ---------- */

  async listForProduct(
    productId: string,
    query: ReviewListQuery,
  ): Promise<{ items: ReviewDoc[]; meta: unknown; summary: Awaited<ReturnType<typeof reviewRepository.computeProductRating>> }> {
    const filter: Record<string, unknown> = { productId, status: 'approved' };
    if (query.rating) filter.rating = query.rating;
    const [paged, summary] = await Promise.all([
      reviewRepository.paginate(filter, {
        page: query.page,
        limit: query.limit,
        sort: SORT_MAP[query.sort],
      }),
      reviewRepository.computeProductRating(productId),
    ]);
    return { items: paged.items, meta: paged.meta, summary };
  }

  /* ---------- User write ---------- */

  async create(
    userId: string,
    body: { productId: string; rating: number; title?: string; body: string; images?: { url: string; alt?: string }[] },
  ): Promise<ReviewDoc> {
    const product = await Product.findById(body.productId).select('_id status').lean();
    if (product?.status !== 'published') {
      throw HttpError.notFound('Product not found');
    }

    const existing = await Review.findOne({ productId: body.productId, userId });
    if (existing) {
      throw HttpError.conflict('You have already reviewed this product', { code: 'DUPLICATE_REVIEW' });
    }

    const verifiedPurchase = await Order.exists({
      userId,
      'items.productId': product._id,
      status: { $in: ['delivered', 'completed'] },
    });

    const user = await User.findById(userId).select('firstName lastName avatarUrl').lean();

    const created = await Review.create({
      productId: product._id,
      userId,
      rating: body.rating,
      title: body.title,
      body: body.body,
      images: body.images?.map((i) => ({ url: i.url, alt: i.alt ?? '' })),
      verifiedPurchase: Boolean(verifiedPurchase),
      authorName: user ? `${user.firstName} ${user.lastName.charAt(0)}.`.trim() : undefined,
      authorAvatarUrl: user?.avatarUrl,
      status: 'pending',
    });

    return created.toObject();
  }

  async update(
    userId: string,
    reviewId: string,
    patch: { rating?: number; title?: string; body?: string; images?: { url: string; alt?: string }[] },
  ): Promise<ReviewDoc> {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) throw HttpError.notFound('Review not found');
    if (patch.rating !== undefined) review.rating = patch.rating as 1 | 2 | 3 | 4 | 5;
    if (patch.title !== undefined) review.title = patch.title;
    if (patch.body !== undefined) review.body = patch.body;
    if (patch.images !== undefined) {
      review.images = patch.images.map((i) => ({ url: i.url, alt: i.alt ?? '' }));
    }
    review.status = 'pending';
    await review.save();
    return review.toObject();
  }

  async delete(userId: string, reviewId: string): Promise<void> {
    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) throw HttpError.notFound('Review not found');
    await reviewRepository.softDeleteById(reviewId);
    await this.recomputeAndPersistRating(String(review.productId));
  }

  async markHelpful(reviewId: string, helpful: boolean): Promise<ReviewDoc> {
    const updated = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: helpful ? { helpfulCount: 1 } : { notHelpfulCount: 1 } },
      { new: true },
    );
    if (!updated) throw HttpError.notFound('Review not found');
    return updated.toObject();
  }

  async report(reviewId: string, _reason: string): Promise<void> {
    const updated = await Review.findByIdAndUpdate(reviewId, {
      $inc: { reportedCount: 1 },
      $set: { status: 'flagged' },
    });
    if (!updated) throw HttpError.notFound('Review not found');
  }

  /* ---------- Moderation ---------- */

  async moderate(
    reviewId: string,
    body: { status: 'approved' | 'rejected' | 'flagged'; moderatorNote?: string },
  ): Promise<ReviewDoc> {
    const review = await Review.findById(reviewId);
    if (!review) throw HttpError.notFound('Review not found');
    review.status = body.status;
    if (body.moderatorNote !== undefined) review.moderatorNote = body.moderatorNote;
    await review.save();
    await this.recomputeAndPersistRating(String(review.productId));
    return review.toObject();
  }

  async adminList(query: ReviewListQuery & { status?: ReviewDoc['status'] }): Promise<{ items: ReviewDoc[]; meta: unknown }> {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.rating) filter.rating = query.rating;
    const paged = await reviewRepository.paginate(filter, {
      page: query.page,
      limit: query.limit,
      sort: SORT_MAP[query.sort],
    });
    return { items: paged.items, meta: paged.meta };
  }

  /* ---------- Rating recompute ---------- */

  private async recomputeAndPersistRating(productId: string): Promise<void> {
    const rating = await reviewRepository.computeProductRating(productId);
    await productRepository.updateRating(productId, rating);
  }

  async recompute(productId: string): Promise<void> {
    return this.recomputeAndPersistRating(productId);
  }
}

export const reviewsService = new ReviewsService();
