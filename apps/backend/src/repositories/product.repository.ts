import type { FilterQuery, Types } from 'mongoose';

import { Product, type ProductDoc } from '../models/product.model';

import { BaseRepository } from './base.repository';

export interface ProductListFilters {
  status?: ProductDoc['status'];
  categoryId?: Types.ObjectId | string;
  brandId?: Types.ObjectId | string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tags?: string[];
  search?: string;
}

export class ProductRepository extends BaseRepository<ProductDoc> {
  constructor() {
    super(Product);
  }

  findBySlug(slug: string): Promise<ProductDoc | null> {
    return this.findOne({ slug: slug.toLowerCase() }, { populate: 'brandId primaryCategoryId' });
  }

  findBySku(sku: string): Promise<ProductDoc | null> {
    return this.findOne({ sku: sku.toUpperCase() });
  }

  buildListFilter(filters: ProductListFilters): FilterQuery<ProductDoc> {
    const f: Record<string, unknown> = { status: filters.status ?? 'published' };
    if (filters.categoryId) f.categoryIds = filters.categoryId;
    if (filters.brandId) f.brandId = filters.brandId;
    if (filters.tags && filters.tags.length > 0) f.tags = { $in: filters.tags };
    if (filters.inStock) f.stockStatus = { $in: ['in_stock', 'low_stock', 'preorder'] };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const range: Record<string, number> = {};
      if (filters.minPrice !== undefined) range.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) range.$lte = filters.maxPrice;
      f['price.amount'] = range;
    }
    if (filters.search) f.$text = { $search: filters.search };
    return f as FilterQuery<ProductDoc>;
  }

  async incrementView(productId: Types.ObjectId | string): Promise<void> {
    await Product.updateOne({ _id: productId }, { $inc: { views: 1 } }).exec();
  }

  async recordSale(productId: Types.ObjectId | string, quantity: number): Promise<void> {
    await Product.updateOne(
      { _id: productId },
      { $inc: { salesCount: quantity } },
      { runValidators: false },
    ).exec();
  }

  async updateRating(
    productId: Types.ObjectId | string,
    rating: ProductDoc['rating'],
  ): Promise<void> {
    await Product.updateOne({ _id: productId }, { $set: { rating } }).exec();
  }

  async related(
    productId: Types.ObjectId | string,
    primaryCategoryId: Types.ObjectId | string,
    limit = 8,
  ): Promise<ProductDoc[]> {
    return this.find(
      { _id: { $ne: productId }, primaryCategoryId, status: 'published' },
      { sort: { 'rating.average': -1, salesCount: -1 } as Record<string, 1 | -1> },
    ).then((rows) => rows.slice(0, limit));
  }
}

export const productRepository = new ProductRepository();
