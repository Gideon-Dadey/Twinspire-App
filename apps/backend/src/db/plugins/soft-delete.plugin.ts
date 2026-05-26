import type { CallbackWithoutResultAndOptionalError, Query, Schema } from 'mongoose';

type MongooseHookOp =
  | 'find'
  | 'findOne'
  | 'findOneAndUpdate'
  | 'findOneAndDelete'
  | 'findOneAndReplace'
  | 'count'
  | 'countDocuments'
  | 'estimatedDocumentCount'
  | 'updateOne'
  | 'updateMany'
  | 'deleteOne'
  | 'deleteMany'
  | 'distinct'
  | 'replaceOne';

/**
 * Soft-delete plugin.
 *
 * Adds:
 *   - `deletedAt: Date | null` field (indexed)
 *   - `softDelete()` instance method (sets deletedAt to now)
 *   - `restore()` instance method (clears deletedAt)
 *   - `findDeleted()` / `findWithDeleted()` static methods
 *   - A query middleware that filters `deletedAt: null` for find* queries
 *     unless `{ withDeleted: true }` is passed via `Query#setOptions`.
 *
 * To opt-out of the filter per query:
 *   `Model.find(...).setOptions({ withDeleted: true })`
 */
export interface SoftDeleteDocument {
  deletedAt: Date | null;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export interface SoftDeleteModel<T> {
  findDeleted(filter?: Record<string, unknown>): Promise<T[]>;
  findWithDeleted(filter?: Record<string, unknown>): Promise<T[]>;
}

const FIND_OPS: MongooseHookOp[] = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndDelete',
  'findOneAndReplace',
  'count',
  'countDocuments',
  'estimatedDocumentCount',
  'updateOne',
  'updateMany',
  'deleteOne',
  'deleteMany',
  'distinct',
  'replaceOne',
];

export function softDeletePlugin(schema: Schema): void {
  schema.add({
    deletedAt: {
      type: Date,
      default: null,
      index: { sparse: true },
    },
  });

  schema.methods.softDelete = async function softDelete() {
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function restore() {
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.findDeleted = function findDeleted(filter: Record<string, unknown> = {}) {
    return this.find({ ...filter, deletedAt: { $ne: null } }).setOptions({ withDeleted: true });
  };

  schema.statics.findWithDeleted = function findWithDeleted(filter: Record<string, unknown> = {}) {
    return this.find(filter).setOptions({ withDeleted: true });
  };

  for (const op of FIND_OPS) {
    schema.pre(
      op as 'find',
      function applySoftDeleteFilter(
        this: Query<unknown, unknown>,
        next: CallbackWithoutResultAndOptionalError,
      ) {
        const opts = this.getOptions() as { withDeleted?: boolean };
        if (opts.withDeleted) return next();
        const filter = this.getFilter();
        if (!('deletedAt' in filter)) {
          this.where({ deletedAt: null });
        }
        return next();
      },
    );
  }

  schema.pre('aggregate', function applySoftDeleteAggregate(next) {
    const opts = (this as { options?: { withDeleted?: boolean } }).options;
    if (opts?.withDeleted) return next();
    this.pipeline().unshift({ $match: { deletedAt: null } });
    return next();
  });
}
