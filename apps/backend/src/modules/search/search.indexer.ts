import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { Brand } from '../../models/brand.model';
import { Category } from '../../models/category.model';
import { Product, type ProductDoc } from '../../models/product.model';

import { getSearchClient } from './elasticsearch.client';

const INDEX = () => env.ELASTICSEARCH_PRODUCT_INDEX;

const PRODUCT_MAPPING = {
  properties: {
    sku: { type: 'keyword' },
    name: {
      type: 'text',
      fields: { keyword: { type: 'keyword', ignore_above: 256 } },
      analyzer: 'standard',
    },
    slug: { type: 'keyword' },
    description: { type: 'text' },
    shortDescription: { type: 'text' },
    brandId: { type: 'keyword' },
    brandName: { type: 'keyword' },
    categoryIds: { type: 'keyword' },
    categoryNames: { type: 'keyword' },
    tags: { type: 'keyword' },
    condition: { type: 'keyword' },
    status: { type: 'keyword' },
    stockStatus: { type: 'keyword' },
    price: { type: 'double' },
    currency: { type: 'keyword' },
    rating: { type: 'double' },
    ratingCount: { type: 'integer' },
    salesCount: { type: 'integer' },
    isFeatured: { type: 'boolean' },
    isBestSeller: { type: 'boolean' },
    isNewArrival: { type: 'boolean' },
    createdAt: { type: 'date' },
  },
} as const;

export interface IndexedProduct {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brandId: string;
  brandName?: string;
  categoryIds: string[];
  categoryNames: string[];
  tags: string[];
  condition: string;
  status: string;
  stockStatus: string;
  price: number;
  currency: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  createdAt: Date;
}

export class SearchIndexer {
  async ensureIndex(): Promise<void> {
    const client = getSearchClient();
    if (!client) return;
    const exists = await client.indices.exists({ index: INDEX() });
    if (!exists) {
      await client.indices.create({
        index: INDEX(),
        body: { mappings: PRODUCT_MAPPING },
      });
      logger.info({ index: INDEX() }, 'Created Elasticsearch product index');
    }
  }

  async indexProduct(product: ProductDoc): Promise<void> {
    const client = getSearchClient();
    if (!client) return;
    const doc = await this.buildDocument(product);
    await client.index({ index: INDEX(), id: String(product._id), document: doc });
  }

  async deleteProduct(productId: string): Promise<void> {
    const client = getSearchClient();
    if (!client) return;
    try {
      await client.delete({ index: INDEX(), id: productId });
    } catch (err) {
      // 404 is fine
      logger.debug({ err }, 'Search delete: document not found');
    }
  }

  async reindexAll(): Promise<{ indexed: number }> {
    const client = getSearchClient();
    if (!client) return { indexed: 0 };
    await this.ensureIndex();

    let indexed = 0;
    const batchSize = 500;
    let lastId: string | null = null;

    while (true) {
      const filter = lastId ? { _id: { $gt: lastId } } : {};
      const batch: ProductDoc[] = await Product.find(filter).sort({ _id: 1 }).limit(batchSize).lean();
      if (batch.length === 0) break;

      const ops = (
        await Promise.all(
          batch.map(async (p) => {
            const doc = await this.buildDocument(p);
            return [{ index: { _index: INDEX(), _id: String(p._id) } }, doc] as const;
          }),
        )
      ).flat();

      await client.bulk({ refresh: false, body: ops });
      indexed += batch.length;
      lastId = String(batch[batch.length - 1]!._id);
    }

    logger.info({ indexed }, 'Reindexed all products');
    return { indexed };
  }

  private async buildDocument(product: ProductDoc): Promise<IndexedProduct> {
    const [brand, categories] = await Promise.all([
      Brand.findById(product.brandId).select('name').lean(),
      Category.find({ _id: { $in: product.categoryIds } })
        .select('name')
        .lean(),
    ]);
    return {
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      brandId: String(product.brandId),
      brandName: brand?.name ?? product.brandName,
      categoryIds: product.categoryIds.map(String),
      categoryNames: categories.map((c) => c.name),
      tags: product.tags ?? [],
      condition: product.condition,
      status: product.status,
      stockStatus: product.stockStatus,
      price: product.price.amount,
      currency: product.price.currency,
      rating: product.rating?.average ?? 0,
      ratingCount: product.rating?.count ?? 0,
      salesCount: product.salesCount ?? 0,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      createdAt: product.createdAt,
    };
  }
}

export const searchIndexer = new SearchIndexer();
