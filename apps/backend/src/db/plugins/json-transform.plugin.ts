import type { Schema } from 'mongoose';

/**
 * Normalize `toJSON` and `toObject` output across the codebase:
 *   - rename `_id` → `id`
 *   - strip `__v`
 *   - strip Mongoose internals
 *   - strip any field starting with `_` (private convention)
 *   - leave the original document untouched
 */
export function jsonTransformPlugin(schema: Schema): void {
  const transform = (
    _doc: unknown,
    ret: Record<string, unknown>,
  ): Record<string, unknown> => {
    if ('_id' in ret && ret._id != null) {
      ret.id = String(ret._id);
    }
    delete ret._id;
    delete ret.__v;
    for (const key of Object.keys(ret)) {
      if (key.startsWith('_') && key !== '_id') {
        delete ret[key];
      }
    }
    return ret;
  };

  schema.set('toJSON', { virtuals: true, versionKey: false, transform });
  schema.set('toObject', { virtuals: true, versionKey: false, transform });
}
