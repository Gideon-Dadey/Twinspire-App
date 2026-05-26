import type { Schema } from 'mongoose';

import { jsonTransformPlugin } from './json-transform.plugin';
import { paginatePlugin } from './paginate.plugin';
import { softDeletePlugin } from './soft-delete.plugin';

export { jsonTransformPlugin } from './json-transform.plugin';
export { paginatePlugin, type PaginateOptions, type PaginateResult, type PaginatedModel } from './paginate.plugin';
export { softDeletePlugin, type SoftDeleteDocument, type SoftDeleteModel } from './soft-delete.plugin';

export interface BasePluginsOptions {
  /** Disable soft delete for ephemeral data (sessions, search history). */
  softDelete?: boolean;
  /** Disable pagination (rare — only for tiny lookup collections). */
  paginate?: boolean;
}

// Mongoose's Schema generic is contravariant in the doc type which makes
// strongly-typed call-sites (e.g. `new Schema<MyDoc, MyModel>(...)`) reject
// when passed to `Schema<any>`. Accepting `Schema<any, any, any>` (or `any`)
// keeps every model call site clean while still receiving the plugin features
// at runtime.
type AnySchema = Schema<any, any, any, any, any, any, any, any, any>;

/**
 * Apply the TwinSpire baseline plugins to a schema:
 *   - JSON transform (every schema)
 *   - Pagination static (almost every schema)
 *   - Soft delete (most schemas — disable for ephemeral data)
 */
export function applyBasePlugins(schema: AnySchema, opts: BasePluginsOptions = {}): void {
  const { softDelete = true, paginate = true } = opts;

  jsonTransformPlugin(schema as Schema);
  if (paginate) paginatePlugin(schema as Schema);
  if (softDelete) softDeletePlugin(schema as Schema);
}
