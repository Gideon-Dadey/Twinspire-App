import type { Category } from '@twinspire/types';

const now = '2026-01-01T00:00:00.000Z';

function makeCategory(
  input: Omit<Category, 'createdAt' | 'updatedAt' | 'isActive' | 'ancestors' | 'level' | 'path' | 'isFeatured'> & {
    ancestors?: string[];
    level?: number;
    isFeatured?: boolean;
  },
): Category {
  return {
    ...input,
    ancestors: input.ancestors ?? [],
    level: input.level ?? 0,
    path: input.parentId ? `/${input.slug}` : `/${input.slug}`,
    isActive: true,
    isFeatured: input.isFeatured ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Two-tier category tree: 6 top-level + ~12 subcategories. Slugs are also the
 * URL segment for the listing page.
 */
export const categories: Category[] = [
  makeCategory({
    id: 'c-phones',
    name: 'Phones',
    slug: 'phones',
    description: 'Flagship Android, iOS, foldables, and feature phones.',
    image: {
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=70',
      alt: 'Modern smartphone',
    },
    icon: 'Smartphone',
    position: 1,
    isFeatured: true,
    productCount: 36,
  }),
  makeCategory({
    id: 'c-laptops',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Ultrabooks, creator laptops, workstations, gaming.',
    image: {
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=70',
      alt: 'Open laptop',
    },
    icon: 'Laptop',
    position: 2,
    isFeatured: true,
    productCount: 28,
  }),
  makeCategory({
    id: 'c-tvs',
    name: 'TVs & Audio',
    slug: 'tvs',
    description: 'OLED · QLED · cinema audio · soundbars.',
    image: {
      url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=70',
      alt: 'Modern television',
    },
    icon: 'Tv',
    position: 3,
    isFeatured: true,
    productCount: 22,
  }),
  makeCategory({
    id: 'c-gaming',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Consoles, GPUs, peripherals, monitors.',
    image: {
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=70',
      alt: 'Gaming setup',
    },
    icon: 'Gamepad2',
    position: 4,
    isFeatured: true,
    productCount: 31,
  }),
  makeCategory({
    id: 'c-components',
    name: 'Components',
    slug: 'components',
    description: 'CPUs · GPUs · RAM · SSD · power.',
    image: {
      url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=70',
      alt: 'Computer components',
    },
    icon: 'Cpu',
    position: 5,
    isFeatured: true,
    productCount: 41,
  }),
  makeCategory({
    id: 'c-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Cables, chargers, mice, keyboards, headphones, wearables.',
    image: {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=70',
      alt: 'Audio accessories',
    },
    icon: 'Headphones',
    position: 6,
    isFeatured: true,
    productCount: 58,
  }),

  makeCategory({
    id: 'c-headphones',
    name: 'Headphones',
    slug: 'headphones',
    parentId: 'c-accessories',
    ancestors: ['c-accessories'],
    level: 1,
    position: 1,
    productCount: 14,
  }),
  makeCategory({
    id: 'c-wearables',
    name: 'Wearables',
    slug: 'wearables',
    parentId: 'c-accessories',
    ancestors: ['c-accessories'],
    level: 1,
    position: 2,
    productCount: 11,
  }),
  makeCategory({
    id: 'c-monitors',
    name: 'Monitors',
    slug: 'monitors',
    parentId: 'c-gaming',
    ancestors: ['c-gaming'],
    level: 1,
    position: 1,
    productCount: 9,
  }),
  makeCategory({
    id: 'c-keyboards',
    name: 'Keyboards',
    slug: 'keyboards',
    parentId: 'c-gaming',
    ancestors: ['c-gaming'],
    level: 1,
    position: 2,
    productCount: 8,
  }),
  makeCategory({
    id: 'c-cpus',
    name: 'CPUs',
    slug: 'cpus',
    parentId: 'c-components',
    ancestors: ['c-components'],
    level: 1,
    position: 1,
    productCount: 12,
  }),
  makeCategory({
    id: 'c-gpus',
    name: 'GPUs',
    slug: 'gpus',
    parentId: 'c-components',
    ancestors: ['c-components'],
    level: 1,
    position: 2,
    productCount: 10,
  }),
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getTopLevelCategories(): Category[] {
  return categories.filter((c) => !c.parentId).sort((a, b) => a.position - b.position);
}

export function getChildCategories(parentSlug: string): Category[] {
  const parent = getCategoryBySlug(parentSlug);
  if (!parent) return [];
  return categories.filter((c) => c.parentId === parent.id);
}
