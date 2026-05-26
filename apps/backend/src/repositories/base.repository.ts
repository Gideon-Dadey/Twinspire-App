import type {
  AnyKeys,
  FilterQuery,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  Types,
  UpdateQuery,
} from 'mongoose';

import type { PaginateOptions, PaginateResult, PaginatedModel } from '../db/plugins';

/**
 * Thin abstraction over Mongoose models that:
 *   - centralises lean reads (default) for hot paths
 *   - enforces consistent option shapes
 *   - keeps service code free of Mongoose-specific incantations
 *
 * Repositories do NOT enforce business rules. Those live in service classes.
 */
export interface FindOptions<T> {
  projection?: ProjectionType<T> | null;
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
  sort?: QueryOptions<T>['sort'];
  lean?: boolean;
  withDeleted?: boolean;
}

export class BaseRepository<TDoc> {
  constructor(protected readonly model: Model<TDoc> & Partial<PaginatedModel<TDoc>>) {}

  get name(): string {
    return this.model.modelName;
  }

  async findById(id: string | Types.ObjectId, opts: FindOptions<TDoc> = {}): Promise<TDoc | null> {
    const query = this.model
      .findById(id, opts.projection ?? null)
      .setOptions({ withDeleted: opts.withDeleted });
    if (opts.populate) query.populate(opts.populate as PopulateOptions);
    if (opts.lean !== false) query.lean({ virtuals: true });
    return (await query.exec()) as TDoc | null;
  }

  async findOne(filter: FilterQuery<TDoc>, opts: FindOptions<TDoc> = {}): Promise<TDoc | null> {
    const query = this.model
      .findOne(filter, opts.projection ?? null)
      .setOptions({ withDeleted: opts.withDeleted });
    if (opts.populate) query.populate(opts.populate as PopulateOptions);
    if (opts.sort) query.sort(opts.sort);
    if (opts.lean !== false) query.lean({ virtuals: true });
    return (await query.exec()) as TDoc | null;
  }

  async find(filter: FilterQuery<TDoc>, opts: FindOptions<TDoc> = {}): Promise<TDoc[]> {
    const query = this.model
      .find(filter, opts.projection ?? null)
      .setOptions({ withDeleted: opts.withDeleted });
    if (opts.populate) query.populate(opts.populate as PopulateOptions);
    if (opts.sort) query.sort(opts.sort);
    if (opts.lean !== false) query.lean({ virtuals: true });
    return (await query.exec()) as TDoc[];
  }

  async exists(filter: FilterQuery<TDoc>, opts: { withDeleted?: boolean } = {}): Promise<boolean> {
    const doc = await this.model.exists(filter).setOptions({ withDeleted: opts.withDeleted }).exec();
    return doc !== null;
  }

  async count(filter: FilterQuery<TDoc> = {}, opts: { withDeleted?: boolean } = {}): Promise<number> {
    return this.model.countDocuments(filter).setOptions({ withDeleted: opts.withDeleted }).exec();
  }

  async paginate(
    filter: FilterQuery<TDoc> = {},
    options: PaginateOptions = {},
  ): Promise<PaginateResult<TDoc>> {
    if (!this.model.paginate) {
      throw new Error(`${this.model.modelName} does not have the paginate plugin attached.`);
    }
    return this.model.paginate(filter, options);
  }

  async create(attrs: AnyKeys<TDoc>): Promise<TDoc> {
    const doc = await this.model.create(attrs);
    return doc.toObject() as TDoc;
  }

  async createMany(rows: AnyKeys<TDoc>[]): Promise<TDoc[]> {
    const docs = await this.model.insertMany(rows, { ordered: false });
    return docs.map((d) => (d as unknown as { toObject: () => TDoc }).toObject());
  }

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<TDoc>,
    opts: { withDeleted?: boolean; runValidators?: boolean } = {},
  ): Promise<TDoc | null> {
    const query = this.model
      .findByIdAndUpdate(id, update, {
        new: true,
        runValidators: opts.runValidators ?? true,
      })
      .setOptions({ withDeleted: opts.withDeleted })
      .lean({ virtuals: true });
    return (await query.exec()) as TDoc | null;
  }

  async updateOne(
    filter: FilterQuery<TDoc>,
    update: UpdateQuery<TDoc>,
    opts: { withDeleted?: boolean } = {},
  ): Promise<{ matched: number; modified: number }> {
    const res = await this.model
      .updateOne(filter, update, { runValidators: true })
      .setOptions({ withDeleted: opts.withDeleted })
      .exec();
    return { matched: res.matchedCount, modified: res.modifiedCount };
  }

  async updateMany(
    filter: FilterQuery<TDoc>,
    update: UpdateQuery<TDoc>,
    opts: { withDeleted?: boolean } = {},
  ): Promise<{ matched: number; modified: number }> {
    const res = await this.model
      .updateMany(filter, update, { runValidators: true })
      .setOptions({ withDeleted: opts.withDeleted })
      .exec();
    return { matched: res.matchedCount, modified: res.modifiedCount };
  }

  /** Soft-delete by setting `deletedAt`. Requires the soft-delete plugin. */
  async softDeleteById(id: string | Types.ObjectId): Promise<TDoc | null> {
    return this.updateById(id, { deletedAt: new Date() } as UpdateQuery<TDoc>);
  }

  /** Hard delete — bypasses soft delete. Use sparingly. */
  async hardDeleteById(id: string | Types.ObjectId): Promise<boolean> {
    const res = await this.model.deleteOne({ _id: id }).setOptions({ withDeleted: true }).exec();
    return res.deletedCount > 0;
  }

  async deleteMany(filter: FilterQuery<TDoc>): Promise<number> {
    const res = await this.model.deleteMany(filter).setOptions({ withDeleted: true }).exec();
    return res.deletedCount;
  }
}
