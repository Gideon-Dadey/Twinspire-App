
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { Product, type ProductDoc } from '../../models/product.model';
import { productRepository } from '../../repositories/product.repository';

import { getSearchClient } from './elasticsearch.client';

import type { SearchQuery } from './search.schemas';
import type { SortOrder } from 'mongoose';

const MONGO_SORT_MAP: Record<SearchQuery['sort'], Record<string, SortOrder>> = {
  relevance: { score: -1 },
  newest: { createdAt: -1 },
  'price-asc': { 'price.amount': 1 },
  'price-desc': { 'price.amount': -1 },
  rating: { 'rating.average': -1, 'rating.count': -1 },
  popular: { salesCount: -1, views: -1 },
};

export interface SearchResultItem {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brandName?: string;
  price: number;
  currency: string;
  rating: number;
  ratingCount: number;
  thumbnail?: string;
  highlight?: { name?: string; description?: string };
}

export interface SearchFacets {
  brands: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: { rating: number; count: number }[];
}

export interface SearchResult {
  items: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  facets: SearchFacets;
  source: 'elasticsearch' | 'mongo';
}

export class SearchService {
  async search(query: SearchQuery): Promise<SearchResult> {
    const client = getSearchClient();
    if (client) {
      try {
        return await this.searchInElasticsearch(query);
      } catch (err) {
        logger.warn({ err }, 'Elasticsearch search failed; falling back to Mongo');
      }
    }
    return this.searchInMongo(query);
  }

  async suggest(q: string, limit = 8): Promise<{ name: string; slug: string }[]> {
    const client = getSearchClient();
    if (client) {
      try {
        const result = await client.search<{ name: string; slug: string }>({
          index: env.ELASTICSEARCH_PRODUCT_INDEX,
          body: {
            size: limit,
            query: {
              bool: {
                must: [{ match_phrase_prefix: { name: { query: q } } }],
                filter: [{ term: { status: 'published' } }],
              },
            },
            _source: ['name', 'slug'],
          },
        });
        return result.hits.hits
          .map((h) => h._source)
          .filter((s): s is { name: string; slug: string } => Boolean(s))
          .map((s) => ({ name: s.name, slug: s.slug }));
      } catch (err) {
        logger.warn({ err }, 'ES suggest failed; falling back to Mongo');
      }
    }
    const products = await Product.find(
      { name: { $regex: new RegExp(escapeRegex(q), 'i') }, status: 'published' },
      { name: 1, slug: 1 },
    )
      .limit(limit)
      .lean();
    return products.map((p) => ({ name: p.name, slug: p.slug }));
  }

  /* ---------- ES path ---------- */

  private async searchInElasticsearch(query: SearchQuery): Promise<SearchResult> {
    const client = getSearchClient()!;
    const from = (query.page - 1) * query.limit;

    const must: Record<string, unknown>[] = [
      {
        multi_match: {
          query: query.q,
          fields: ['name^4', 'brandName^3', 'tags^2', 'description', 'shortDescription'],
          fuzziness: 'AUTO',
        },
      },
    ];
    const filter: Record<string, unknown>[] = [{ term: { status: 'published' } }];

    if (query.brand && query.brand.length > 0) {
      filter.push({ terms: { brandName: query.brand } });
    }
    if (query.category) {
      filter.push({ term: { categoryNames: query.category } });
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.push({
        range: {
          price: {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
          },
        },
      });
    }
    if (query.rating !== undefined) filter.push({ range: { rating: { gte: query.rating } } });
    if (query.inStock) filter.push({ terms: { stockStatus: ['in_stock', 'low_stock', 'preorder'] } });

    const sort = this.buildEsSort(query.sort) as unknown as string[];

    const result = await client.search<Record<string, unknown>>({
      index: env.ELASTICSEARCH_PRODUCT_INDEX,
      from,
      size: query.limit,
      sort,
      query: {
        bool: { must, filter },
      },
      highlight: {
        fields: { name: {}, description: { fragment_size: 120, number_of_fragments: 1 } },
      },
      aggs: {
        brands: { terms: { field: 'brandName', size: 30 } },
        categories: { terms: { field: 'categoryNames', size: 30 } },
        ratings: { terms: { field: 'rating', size: 6 } },
        price_min: { min: { field: 'price' } },
        price_max: { max: { field: 'price' } },
      },
    });

    const totalRaw = result.hits.total;
    const total = typeof totalRaw === 'number' ? totalRaw : (totalRaw?.value ?? 0);

    const items: SearchResultItem[] = result.hits.hits.map((hit) => {
      const src = (hit._source ?? {});
      return {
        id: String(hit._id),
        sku: String(src.sku ?? ''),
        name: String(src.name ?? ''),
        slug: String(src.slug ?? ''),
        brandName: src.brandName ? String(src.brandName) : undefined,
        price: Number(src.price ?? 0),
        currency: String(src.currency ?? 'USD'),
        rating: Number(src.rating ?? 0),
        ratingCount: Number(src.ratingCount ?? 0),
        highlight: {
          name: hit.highlight?.name?.[0],
          description: hit.highlight?.description?.[0],
        },
      };
    });

    const aggs = result.aggregations as
      | {
          brands?: { buckets: { key: string; doc_count: number }[] };
          categories?: { buckets: { key: string; doc_count: number }[] };
          ratings?: { buckets: { key: number; doc_count: number }[] };
          price_min?: { value: number };
          price_max?: { value: number };
        }
      | undefined;

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.max(1, Math.ceil(total / query.limit)),
      facets: {
        brands: (aggs?.brands?.buckets ?? []).map((b) => ({ name: b.key, count: b.doc_count })),
        categories: (aggs?.categories?.buckets ?? []).map((b) => ({ name: b.key, count: b.doc_count })),
        priceRange: { min: aggs?.price_min?.value ?? 0, max: aggs?.price_max?.value ?? 0 },
        ratings: (aggs?.ratings?.buckets ?? []).map((b) => ({ rating: b.key, count: b.doc_count })),
      },
      source: 'elasticsearch',
    };
  }

  private buildEsSort(sort: SearchQuery['sort']): unknown[] {
    switch (sort) {
      case 'newest':
        return [{ createdAt: 'desc' }];
      case 'price-asc':
        return [{ price: 'asc' }];
      case 'price-desc':
        return [{ price: 'desc' }];
      case 'rating':
        return [{ rating: 'desc' }, { ratingCount: 'desc' }];
      case 'popular':
        return [{ salesCount: 'desc' }];
      case 'relevance':
      default:
        return ['_score'];
    }
  }

  /* ---------- Mongo fallback ---------- */

  private async searchInMongo(query: SearchQuery): Promise<SearchResult> {
    const filter: Record<string, unknown> = {
      status: 'published',
      $text: { $search: query.q },
    };
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter['price.amount'] = {
        ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}),
      };
    }
    if (query.rating !== undefined) filter['rating.average'] = { $gte: query.rating };
    if (query.inStock) filter.stockStatus = { $in: ['in_stock', 'low_stock', 'preorder'] };

    const sort =
      query.sort === 'relevance'
        ? { score: { $meta: 'textScore' } as never }
        : MONGO_SORT_MAP[query.sort];

    const paged = await productRepository.paginate(filter, {
      page: query.page,
      limit: query.limit,
      sort: sort,
    });

    const items: SearchResultItem[] = (paged.items).map((p) => ({
      id: String(p._id),
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      brandName: p.brandName,
      price: p.price.amount,
      currency: p.price.currency,
      rating: p.rating?.average ?? 0,
      ratingCount: p.rating?.count ?? 0,
      thumbnail: p.images[0]?.url,
    }));

    return {
      items,
      total: paged.meta.total,
      page: paged.meta.page,
      limit: paged.meta.limit,
      pages: paged.meta.totalPages,
      facets: { brands: [], categories: [], priceRange: { min: 0, max: 0 }, ratings: [] },
      source: 'mongo',
    };
  }
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const searchService = new SearchService();
