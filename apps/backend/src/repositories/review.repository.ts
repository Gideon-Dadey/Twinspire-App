import type { Types } from 'mongoose';

import { Review, type ReviewDoc } from '../models/review.model';

import { BaseRepository } from './base.repository';

export interface RatingDistribution {
  average: number;
  count: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export class ReviewRepository extends BaseRepository<ReviewDoc> {
  constructor() {
    super(Review);
  }

  async computeProductRating(productId: Types.ObjectId | string): Promise<RatingDistribution> {
    const rows = await Review.aggregate<{ rating: number; count: number }>([
      { $match: { productId, status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { _id: 0, rating: '$_id', count: 1 } },
    ]).exec();

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    let total = 0;
    let weighted = 0;
    for (const row of rows) {
      const r = row.rating as 1 | 2 | 3 | 4 | 5;
      distribution[r] = row.count;
      total += row.count;
      weighted += r * row.count;
    }

    return {
      average: total > 0 ? Number((weighted / total).toFixed(2)) : 0,
      count: total,
      distribution,
    };
  }
}

export const reviewRepository = new ReviewRepository();
