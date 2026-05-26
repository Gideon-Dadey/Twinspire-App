import type { BaseEntity, ID, Image, VideoAsset } from './common';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Review extends BaseEntity {
  productId: ID;
  userId: ID;
  orderId?: ID;
  authorName?: string;
  authorAvatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  images?: Image[];
  videos?: VideoAsset[];
  helpfulCount: number;
  notHelpfulCount: number;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  moderatorNote?: string;
}
