import type { PaginatedResult, Product } from '@twinspire/types';

import { brands as ALL_BRANDS } from '@/data/brands';
import { categories as ALL_CATEGORIES, getCategoryBySlug } from '@/data/categories';
import { products as ALL_PRODUCTS } from '@/data/products';

export type SortKey =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'newest'
  | 'popularity';

export interface CatalogQuery {
  q?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  tags?: string[];
  sort?: SortKey;
  page?: number;
  limit?: number;
}

export interface FacetOption<T extends string = string> {
  value: T;
  label: string;
  count: number;
}

export interface CatalogFacets {
  brands: FacetOption[];
  ratings: FacetOption[];
  priceRange: { min: number; max: number };
  conditions: FacetOption[];
}

export interface CatalogResult extends PaginatedResult<Product> {
  facets: CatalogFacets;
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

function matchesQuery(p: Product, q: string): boolean {
  const haystack = [
    p.name,
    p.brandName ?? '',
    p.shortDescription ?? '',
    p.description,
    ...(p.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function inPriceRange(p: Product, min?: number, max?: number): boolean {
  if (min != null && p.price.amount < min) return false;
  if (max != null && p.price.amount > max) return false;
  return true;
}

function applyFilters(input: Product[], query: CatalogQuery): Product[] {
  let result = input;

  if (query.categorySlug) {
    const category = getCategoryBySlug(query.categorySlug);
    if (category) {
      const ids = new Set([category.id]);
      ALL_CATEGORIES.filter((c) => c.parentId === category.id).forEach((c) => ids.add(c.id));
      result = result.filter((p) => p.categoryIds.some((cid) => ids.has(cid)));
    } else {
      result = [];
    }
  }

  if (query.brandSlugs && query.brandSlugs.length > 0) {
    const brandIds = new Set(
      ALL_BRANDS.filter((b) => query.brandSlugs?.includes(b.slug)).map((b) => b.id),
    );
    result = result.filter((p) => brandIds.has(p.brandId));
  }

  if (query.minRating != null) {
    result = result.filter((p) => (p.rating?.average ?? 0) >= (query.minRating ?? 0));
  }

  if (query.inStock === true) {
    result = result.filter((p) => p.stockStatus === 'in_stock' || p.stockStatus === 'low_stock');
  }

  if (query.q && query.q.trim().length > 0) {
    result = result.filter((p) => matchesQuery(p, query.q ?? ''));
  }

  result = result.filter((p) => inPriceRange(p, query.minPrice, query.maxPrice));

  return result;
}

function applySort(input: Product[], sort: SortKey | undefined): Product[] {
  const list = [...input];
  switch (sort) {
    case 'price_asc':
      return list.sort((a, b) => a.price.amount - b.price.amount);
    case 'price_desc':
      return list.sort((a, b) => b.price.amount - a.price.amount);
    case 'rating_desc':
      return list.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));
    case 'newest':
      return list.sort(
        (a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''),
      );
    case 'popularity':
      return list.sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0));
    case 'relevance':
    default:
      return list;
  }
}

function computeFacets(forFacets: Product[]): CatalogFacets {
  const brandCounts = new Map<string, number>();
  forFacets.forEach((p) => {
    brandCounts.set(p.brandId, (brandCounts.get(p.brandId) ?? 0) + 1);
  });
  const brandFacets: FacetOption[] = ALL_BRANDS.map((b) => ({
    value: b.slug,
    label: b.name,
    count: brandCounts.get(b.id) ?? 0,
  }))
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count);

  const ratingFacets: FacetOption[] = [4.5, 4, 3.5, 3].map((min) => ({
    value: String(min),
    label: `${min}★ & up`,
    count: forFacets.filter((p) => (p.rating?.average ?? 0) >= min).length,
  }));

  const conditionFacets: FacetOption[] = ['new', 'refurbished', 'open_box', 'used'].map((c) => ({
    value: c,
    label: c.replace('_', ' '),
    count: forFacets.filter((p) => p.condition === c).length,
  })).filter((f) => f.count > 0);

  const prices = forFacets.map((p) => p.price.amount);
  const priceRange = {
    min: prices.length ? Math.floor(Math.min(...prices)) : 0,
    max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };

  return { brands: brandFacets, ratings: ratingFacets, priceRange, conditions: conditionFacets };
}

export function queryCatalog(query: CatalogQuery = {}): CatalogResult {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, query.limit ?? DEFAULT_LIMIT));

  /**
   * For each facet, we compute counts excluding that facet's own filter,
   * but for simplicity & determinism we compute facets on the categorySlug-only
   * subset. This matches the UX of "narrowing within a category".
   */
  const baseForFacets = applyFilters(ALL_PRODUCTS, {
    categorySlug: query.categorySlug,
    q: query.q,
  });
  const facets = computeFacets(baseForFacets);

  const filtered = applyFilters(ALL_PRODUCTS, query);
  const sorted = applySort(filtered, query.sort);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const items = sorted.slice(start, start + limit);

  return {
    items,
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
    facets,
  };
}
