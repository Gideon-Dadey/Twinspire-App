import { Brand, type BrandDoc } from '../models/brand.model';

import { BaseRepository } from './base.repository';

export class BrandRepository extends BaseRepository<BrandDoc> {
  constructor() {
    super(Brand);
  }

  findBySlug(slug: string): Promise<BrandDoc | null> {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  findFeatured(limit = 12): Promise<BrandDoc[]> {
    return this.find(
      { isActive: true, isFeatured: true },
      { sort: { name: 1 } as Record<string, 1 | -1> },
    ).then((rows) => rows.slice(0, limit));
  }
}

export const brandRepository = new BrandRepository();
