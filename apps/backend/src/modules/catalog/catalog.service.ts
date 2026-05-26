
import { Brand, type BrandDoc } from '../../models/brand.model';
import { Category, type CategoryDoc } from '../../models/category.model';
import { Product, type ProductDoc } from '../../models/product.model';
import { brandRepository } from '../../repositories/brand.repository';
import { categoryRepository } from '../../repositories/category.repository';
import { productRepository } from '../../repositories/product.repository';
import { cacheService } from '../../services/cache';
import { HttpError } from '../../utils/http-error';

import type { ProductListQuery } from './catalog.schemas';
import type { PaginateResult } from '../../db/plugins';
import type { FilterQuery, SortOrder, Types } from 'mongoose';

const PUBLIC_PRODUCT_FIELDS = [
  '_id',
  'sku',
  'name',
  'slug',
  'shortDescription',
  'description',
  'brandId',
  'brandName',
  'categoryIds',
  'primaryCategoryId',
  'tags',
  'condition',
  'status',
  'stockStatus',
  'price',
  'images',
  'attributes',
  'specifications',
  'variants',
  'hasVariants',
  'rating',
  'isFeatured',
  'isBestSeller',
  'isNewArrival',
  'releaseDate',
  'seo',
  'views',
  'salesCount',
  'createdAt',
  'updatedAt',
] as const;

const SORT_MAP: Record<ProductListQuery['sort'], Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  'price-asc': { 'price.amount': 1 },
  'price-desc': { 'price.amount': -1 },
  rating: { 'rating.average': -1, 'rating.count': -1 },
  popular: { salesCount: -1, views: -1 },
  name: { name: 1 },
};

export interface ProductFacets {
  brands: { id: string; name: string; slug: string; count: number }[];
  priceRange: { min: number; max: number };
  conditions: { value: string; count: number }[];
  ratings: { rating: number; count: number }[];
  tags: { tag: string; count: number }[];
}

export class CatalogService {
  /* =====================================================================
     PRODUCTS — public read
     ===================================================================== */

  async listProducts(query: ProductListQuery): Promise<{
    items: ProductDoc[];
    meta: PaginateResult<ProductDoc>['meta'];
    facets: ProductFacets;
  }> {
    const filter = await this.buildListFilter(query);
    const sort = SORT_MAP[query.sort];

    const cacheKey = `catalog:list:${stableKey({ filter, sort, page: query.page, limit: query.limit })}`;
    const result = await cacheService.wrap(cacheKey, 60, async () => {
      const [paged, facets] = await Promise.all([
        productRepository.paginate(filter, {
          page: query.page,
          limit: query.limit,
          sort,
          projection: PUBLIC_PRODUCT_FIELDS.reduce<Record<string, 1>>((acc, f) => {
            acc[f] = 1;
            return acc;
          }, {}),
        }),
        this.computeFacets(filter),
      ]);
      return { items: paged.items, meta: paged.meta, facets };
    });
    return result;
  }

  async getProductBySlug(slug: string): Promise<ProductDoc> {
    const product = await productRepository.findBySlug(slug);
    if (product?.status !== 'published') {
      throw HttpError.notFound('Product not found');
    }
    return product;
  }

  async related(productId: Types.ObjectId | string, primaryCategoryId: Types.ObjectId | string, limit = 8): Promise<ProductDoc[]> {
    return productRepository.related(productId, primaryCategoryId, limit);
  }

  async featured(limit = 12): Promise<ProductDoc[]> {
    return productRepository.find(
      { isFeatured: true, status: 'published' },
      { sort: { 'rating.average': -1, salesCount: -1 } as Record<string, SortOrder> },
    ).then((r) => r.slice(0, limit));
  }

  async bestSellers(limit = 12): Promise<ProductDoc[]> {
    return productRepository.find(
      { isBestSeller: true, status: 'published' },
      { sort: { salesCount: -1 } as Record<string, SortOrder> },
    ).then((r) => r.slice(0, limit));
  }

  async newArrivals(limit = 12): Promise<ProductDoc[]> {
    return productRepository.find(
      { isNewArrival: true, status: 'published' },
      { sort: { releaseDate: -1, createdAt: -1 } as Record<string, SortOrder> },
    ).then((r) => r.slice(0, limit));
  }

  async incrementView(productId: Types.ObjectId | string): Promise<void> {
    await productRepository.incrementView(productId);
  }

  /* =====================================================================
     PRODUCTS — admin write
     ===================================================================== */

  async createProduct(input: Record<string, unknown>): Promise<ProductDoc> {
    const dup = await Product.exists({
      $or: [{ slug: input.slug }, { sku: input.sku }],
    });
    if (dup) throw HttpError.conflict('SKU or slug already exists', { code: 'DUPLICATE_PRODUCT' });
    const created = await Product.create(input);
    await this.invalidateProductCaches();
    return created.toObject();
  }

  async updateProduct(productId: string, patch: Record<string, unknown>): Promise<ProductDoc> {
    const updated = await Product.findByIdAndUpdate(productId, { $set: patch }, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw HttpError.notFound('Product not found');
    await this.invalidateProductCaches();
    return updated.toObject();
  }

  async softDeleteProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) throw HttpError.notFound('Product not found');
    product.status = 'archived';
    await product.save();
    await productRepository.softDeleteById(productId);
    await this.invalidateProductCaches();
  }

  /* =====================================================================
     CATEGORIES
     ===================================================================== */

  async categoryTree(): Promise<unknown[]> {
    return cacheService.wrap('catalog:cat-tree', 300, () => categoryRepository.tree());
  }

  async getCategoryBySlug(slug: string): Promise<CategoryDoc> {
    const cat = await categoryRepository.findBySlug(slug);
    if (!cat?.isActive) throw HttpError.notFound('Category not found');
    return cat;
  }

  async categoryBreadcrumb(slug: string): Promise<CategoryDoc[]> {
    const target = await this.getCategoryBySlug(slug);
    if (!target.ancestors?.length) return [target];
    const ancestors = await Category.find({ _id: { $in: target.ancestors } })
      .sort({ level: 1 })
      .lean();
    return [...ancestors, target] as CategoryDoc[];
  }

  async createCategory(input: Record<string, unknown>): Promise<CategoryDoc> {
    const existing = await Category.exists({ slug: input.slug as string });
    if (existing) throw HttpError.conflict('Category slug already exists');

    let level = 0;
    let ancestors: Types.ObjectId[] = [];
    let path = '/' + (input.slug as string);

    if (input.parentId) {
      const parent = await Category.findById(input.parentId);
      if (!parent) throw HttpError.badRequest('Parent category not found');
      level = parent.level + 1;
      ancestors = [...parent.ancestors, parent._id];
      path = `${parent.path}/${input.slug as string}`;
    }

    const created = await Category.create({ ...input, level, ancestors, path });
    await cacheService.del('catalog:cat-tree');
    return created.toObject();
  }

  async updateCategory(categoryId: string, patch: Record<string, unknown>): Promise<CategoryDoc> {
    const cat = await Category.findByIdAndUpdate(categoryId, { $set: patch }, { new: true });
    if (!cat) throw HttpError.notFound('Category not found');
    await cacheService.del('catalog:cat-tree');
    return cat.toObject();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const cat = await Category.findById(categoryId);
    if (!cat) throw HttpError.notFound('Category not found');
    const childCount = await Category.countDocuments({ parentId: cat._id });
    if (childCount > 0) {
      throw HttpError.conflict('Cannot delete a category that has children', { code: 'HAS_CHILDREN' });
    }
    const productCount = await Product.countDocuments({ categoryIds: cat._id });
    if (productCount > 0) {
      throw HttpError.conflict('Cannot delete a category that has products', {
        code: 'HAS_PRODUCTS',
      });
    }
    await categoryRepository.softDeleteById(categoryId);
    await cacheService.del('catalog:cat-tree');
  }

  /* =====================================================================
     BRANDS
     ===================================================================== */

  listBrands(): Promise<BrandDoc[]> {
    return cacheService.wrap('catalog:brands', 300, () =>
      brandRepository.find(
        { isActive: true },
        { sort: { isFeatured: -1, name: 1 } as Record<string, SortOrder> },
      ),
    );
  }

  async getBrandBySlug(slug: string): Promise<BrandDoc> {
    const brand = await brandRepository.findBySlug(slug);
    if (!brand?.isActive) throw HttpError.notFound('Brand not found');
    return brand;
  }

  async createBrand(input: Record<string, unknown>): Promise<BrandDoc> {
    const existing = await Brand.exists({ slug: input.slug as string });
    if (existing) throw HttpError.conflict('Brand slug already exists');
    const created = await Brand.create(input);
    await cacheService.del('catalog:brands');
    return created.toObject();
  }

  async updateBrand(brandId: string, patch: Record<string, unknown>): Promise<BrandDoc> {
    const brand = await Brand.findByIdAndUpdate(brandId, { $set: patch }, { new: true });
    if (!brand) throw HttpError.notFound('Brand not found');
    await cacheService.del('catalog:brands');
    return brand.toObject();
  }

  async deleteBrand(brandId: string): Promise<void> {
    const productCount = await Product.countDocuments({ brandId });
    if (productCount > 0) {
      throw HttpError.conflict('Cannot delete a brand that still has products', {
        code: 'HAS_PRODUCTS',
      });
    }
    await brandRepository.softDeleteById(brandId);
    await cacheService.del('catalog:brands');
  }

  /* =====================================================================
     Internal
     ===================================================================== */

  private async buildListFilter(query: ProductListQuery): Promise<FilterQuery<ProductDoc>> {
    const filter: Record<string, unknown> = { status: 'published' };

    if (query.category) {
      const cat = await categoryRepository.findBySlug(query.category);
      if (!cat) throw HttpError.notFound('Category not found');
      filter.categoryIds = cat._id;
    }

    if (query.brand && query.brand.length > 0) {
      const brands = await Brand.find({ slug: { $in: query.brand } }).select('_id');
      filter.brandId = { $in: brands.map((b) => b._id) };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const range: Record<string, number> = {};
      if (query.minPrice !== undefined) range.$gte = query.minPrice;
      if (query.maxPrice !== undefined) range.$lte = query.maxPrice;
      filter['price.amount'] = range;
    }

    if (query.condition) filter.condition = query.condition;
    if (query.inStock) filter.stockStatus = { $in: ['in_stock', 'low_stock', 'preorder'] };
    if (query.tag) filter.tags = query.tag.toLowerCase();
    if (query.rating !== undefined) filter['rating.average'] = { $gte: query.rating };
    if (query.q) filter.$text = { $search: query.q };

    return filter;
  }

  private async computeFacets(baseFilter: FilterQuery<ProductDoc>): Promise<ProductFacets> {
    // Facets ignore brand/price/condition filters from the user's current
    // selection so the sidebar can show the *complete* available options.
    const facetFilter = { ...(baseFilter as Record<string, unknown>) };
    delete facetFilter.brandId;
    delete facetFilter['price.amount'];
    delete facetFilter.condition;
    delete facetFilter['rating.average'];

    const [brandAgg, priceAgg, conditionAgg, ratingAgg, tagAgg] = await Promise.all([
      Product.aggregate<{
        _id: Types.ObjectId;
        count: number;
        name: string;
        slug: string;
      }>([
        { $match: facetFilter },
        { $group: { _id: '$brandId', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'brands',
            localField: '_id',
            foreignField: '_id',
            as: 'brand',
          },
        },
        { $unwind: '$brand' },
        {
          $project: { _id: 1, count: 1, name: '$brand.name', slug: '$brand.slug' },
        },
        { $sort: { count: -1, name: 1 } },
        { $limit: 50 },
      ]),
      Product.aggregate<{ min: number; max: number }>([
        { $match: facetFilter },
        { $group: { _id: null, min: { $min: '$price.amount' }, max: { $max: '$price.amount' } } },
      ]),
      Product.aggregate<{ _id: string; count: number }>([
        { $match: facetFilter },
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Product.aggregate<{ _id: number; count: number }>([
        { $match: facetFilter },
        {
          $group: {
            _id: { $floor: '$rating.average' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
      Product.aggregate<{ _id: string; count: number }>([
        { $match: facetFilter },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 },
      ]),
    ]);

    return {
      brands: brandAgg.map((b) => ({
        id: String(b._id),
        name: b.name,
        slug: b.slug,
        count: b.count,
      })),
      priceRange: { min: priceAgg[0]?.min ?? 0, max: priceAgg[0]?.max ?? 0 },
      conditions: conditionAgg.map((c) => ({ value: c._id, count: c.count })),
      ratings: ratingAgg.map((r) => ({ rating: r._id, count: r.count })),
      tags: tagAgg.map((t) => ({ tag: t._id, count: t.count })),
    };
  }

  private async invalidateProductCaches(): Promise<void> {
    // Invalidate everything matching catalog:list:* via a coarse scan. In a
    // production deployment we'd use a tagged-cache approach; for now this is
    // safe because list cache TTL is short (60s).
    await cacheService.del('catalog:list:*');
  }
}

export const catalogService = new CatalogService();

/* ---------- helpers ---------- */

function stableKey(input: unknown): string {
  return JSON.stringify(input, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (value as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return value;
  });
}
