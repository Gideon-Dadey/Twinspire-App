import type { Types } from 'mongoose';

import { Category, type CategoryDoc } from '../models/category.model';

import { BaseRepository } from './base.repository';

type LeanCategory = CategoryDoc & { _id: Types.ObjectId; id: string };

export interface CategoryTreeNode extends LeanCategory {
  children: CategoryTreeNode[];
}

export class CategoryRepository extends BaseRepository<CategoryDoc> {
  constructor() {
    super(Category);
  }

  findBySlug(slug: string): Promise<CategoryDoc | null> {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  findRoots(): Promise<CategoryDoc[]> {
    return this.find(
      { parentId: null, isActive: true },
      { sort: { position: 1, name: 1 } as Record<string, 1 | -1> },
    );
  }

  /** Builds a fully-nested tree from a flat list of categories. */
  async tree(): Promise<CategoryTreeNode[]> {
    const flat = (await this.find(
      { isActive: true },
      { sort: { level: 1, position: 1 } as Record<string, 1 | -1> },
    )) as LeanCategory[];

    const byId = new Map<string, CategoryTreeNode>();
    for (const cat of flat) {
      byId.set(String(cat.id ?? cat._id), { ...cat, children: [] });
    }

    const roots: CategoryTreeNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId) {
        const parent = byId.get(String(node.parentId));
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}

export const categoryRepository = new CategoryRepository();
