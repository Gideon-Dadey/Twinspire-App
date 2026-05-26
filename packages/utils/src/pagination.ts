import type { PaginatedMeta, PaginatedResult } from '@twinspire/types';

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants';

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
}

export function normalizePagination(input?: { page?: number; limit?: number }): NormalizedPagination {
  const page = Math.max(1, Math.floor(Number(input?.page) || 1));
  const requested = Math.floor(Number(input?.limit) || DEFAULT_PAGE_SIZE);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, requested));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedMeta(
  page: number,
  limit: number,
  total: number,
): PaginatedMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function paginated<T>(items: T[], page: number, limit: number, total: number): PaginatedResult<T> {
  return { items, meta: buildPaginatedMeta(page, limit, total) };
}
