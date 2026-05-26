
import { Product, type ProductDoc } from '../../models/product.model';
import { Wishlist, type WishlistDoc } from '../../models/wishlist.model';
import { getRedis } from '../../services/cache/redis';
import { HttpError } from '../../utils/http-error';

import type { Types } from 'mongoose';

const RECENT_KEY = (userId: string) => `recent:${userId}`;
const RECENT_LIMIT = 50;
const RECENT_TTL_SECONDS = 60 * 60 * 24 * 30;

export class WishlistService {
  /* ---------- Wishlist (persistent) ---------- */

  async getOrCreate(userId: string): Promise<WishlistDoc> {
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = await Wishlist.create({ userId, name: 'My Wishlist' });
    return wishlist.toObject();
  }

  async list(userId: string, opts: { page: number; limit: number }): Promise<{
    wishlist: WishlistDoc;
    products: ProductDoc[];
    pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }> {
    const wishlist = await this.getOrCreate(userId);
    const total = wishlist.items.length;
    const start = (opts.page - 1) * opts.limit;
    const slice = wishlist.items.slice(start, start + opts.limit);
    const products = await Product.find({
      _id: { $in: slice.map((i) => i.productId) },
      status: 'published',
    }).lean();

    const order = new Map(slice.map((i, idx) => [String(i.productId), idx]));
    products.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));

    const totalPages = Math.max(1, Math.ceil(total / opts.limit));
    return {
      wishlist,
      products: products,
      pagination: {
        page: opts.page,
        limit: opts.limit,
        total,
        totalPages,
        hasNext: opts.page < totalPages,
        hasPrev: opts.page > 1,
      },
    };
  }

  async addItem(
    userId: string,
    input: { productId: string; variantId?: string; priceAlertThreshold?: number },
  ): Promise<WishlistDoc> {
    const product = await Product.exists({ _id: input.productId, status: 'published' });
    if (!product) throw HttpError.notFound('Product not found');

    const updated = await Wishlist.findOneAndUpdate(
      { userId, 'items.productId': { $ne: input.productId } },
      {
        $setOnInsert: { name: 'My Wishlist' },
        $push: {
          items: {
            productId: input.productId,
            variantId: input.variantId,
            priceAlertThreshold: input.priceAlertThreshold,
            addedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true },
    );
    return updated.toObject();
  }

  async removeItem(userId: string, productId: string): Promise<WishlistDoc> {
    const updated = await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true },
    );
    if (!updated) throw HttpError.notFound('Wishlist not found');
    return updated.toObject();
  }

  async clear(userId: string): Promise<void> {
    await Wishlist.updateOne({ userId }, { $set: { items: [] } });
  }

  async has(userId: string, productId: string): Promise<boolean> {
    const found = await Wishlist.exists({ userId, 'items.productId': productId });
    return Boolean(found);
  }

  /* ---------- Recently viewed (Redis) ---------- */

  async trackView(userId: string, productId: string): Promise<void> {
    const exists = await Product.exists({ _id: productId, status: 'published' });
    if (!exists) return;
    const redis = getRedis();
    const key = RECENT_KEY(userId);
    await redis.lrem(key, 0, productId);
    await redis.lpush(key, productId);
    await redis.ltrim(key, 0, RECENT_LIMIT - 1);
    await redis.expire(key, RECENT_TTL_SECONDS);
  }

  async recentlyViewed(userId: string, limit = 20): Promise<ProductDoc[]> {
    const redis = getRedis();
    const ids = await redis.lrange(RECENT_KEY(userId), 0, limit - 1);
    if (ids.length === 0) return [];
    const products = await Product.find({
      _id: { $in: ids },
      status: 'published',
    }).lean();
    const order = new Map(ids.map((id, idx) => [id, idx]));
    return (products as ProductDoc[]).sort(
      (a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0),
    );
  }

  async clearRecentlyViewed(userId: string): Promise<void> {
    await getRedis().del(RECENT_KEY(userId));
  }

  /** Convenience: list product ids only — used by other modules. */
  async wishlistProductIds(userId: string): Promise<string[]> {
    const wishlist = await Wishlist.findOne({ userId }, { 'items.productId': 1 }).lean();
    return wishlist?.items.map((i) => String((i as { productId: Types.ObjectId }).productId)) ?? [];
  }
}

export const wishlistService = new WishlistService();
