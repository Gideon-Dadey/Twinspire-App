import type {
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionType,
  Schema,
  SortOrder,
} from 'mongoose';

import { buildPaginatedMeta, normalizePagination } from '@twinspire/utils';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  sort?: string | Record<string, SortOrder>;
  projection?: ProjectionType<unknown> | null;
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
  lean?: boolean;
  withDeleted?: boolean;
}

export interface PaginateResult<T> {
  items: T[];
  meta: ReturnType<typeof buildPaginatedMeta>;
}

export interface PaginatedModel<T> {
  paginate(
    filter?: FilterQuery<T>,
    options?: PaginateOptions,
  ): Promise<PaginateResult<T>>;
}

export function paginatePlugin(schema: Schema): void {
  schema.statics.paginate = async function paginate<T>(
    this: Model<T>,
    filter: FilterQuery<T> = {},
    options: PaginateOptions = {},
  ): Promise<PaginateResult<T>> {
    const { page, limit, skip } = normalizePagination(options);
    const { sort = { createdAt: -1 }, projection = null, populate, lean = true, withDeleted } = options;

    const sortObj: Record<string, SortOrder> =
      typeof sort === 'string' ? parseSortString(sort) : sort;

    const baseQuery = this.find(filter, projection).setOptions({ withDeleted });
    const query = baseQuery.sort(sortObj).skip(skip).limit(limit);

    if (populate) query.populate(populate as PopulateOptions);
    if (lean) query.lean({ virtuals: true });

    const [items, total] = await Promise.all([
      query.exec() as Promise<T[]>,
      this.countDocuments(filter).setOptions({ withDeleted }).exec(),
    ]);

    return { items, meta: buildPaginatedMeta(page, limit, total) };
  };
}

function parseSortString(raw: string): Record<string, SortOrder> {
  const out: Record<string, SortOrder> = {};
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('-')) out[trimmed.slice(1)] = -1;
    else if (trimmed.startsWith('+')) out[trimmed.slice(1)] = 1;
    else out[trimmed] = 1;
  }
  return out;
}
