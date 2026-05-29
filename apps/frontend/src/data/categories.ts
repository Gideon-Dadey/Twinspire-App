import type { Category } from '@twinspire/types';

const now = '2026-01-01T00:00:00.000Z';

function makeCategory(
  input: Omit<
    Category,
    'createdAt' | 'updatedAt' | 'isActive' | 'ancestors' | 'level' | 'path' | 'isFeatured'
  > & {
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
    description:
      'Latest iPhones, Samsung Galaxy, Infinix, Tecno, and Honor — flagships, foldables, and value smartphones.',
    image: {
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=70',
      alt: 'Modern smartphone',
    },
    icon: 'Smartphone',
    position: 1,
    isFeatured: true,
    productCount: 27,
  }),
  makeCategory({
    id: 'c-laptops',
    name: 'Laptops',
    slug: 'laptops',
    description:
      'MacBook, ThinkPad, XPS, Spectre, Galaxy Book, ROG, Nitro, Legion, OMEN — ultrabooks, creator laptops, workstations, and gaming.',
    image: {
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=70',
      alt: 'Open laptop',
    },
    icon: 'Laptop',
    position: 2,
    isFeatured: true,
    productCount: 37,
  }),
  makeCategory({
    id: 'c-tvs',
    name: 'TVs & Audio',
    slug: 'tvs',
    description:
      'OLED, QLED, Neo QLED, and Crystal UHD TVs plus Dolby Atmos soundbars — Samsung, LG, Sony, TCL, Hisense, Sonos, Bose, and JBL.',
    image: {
      url: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn65s90dafxza/gallery/us-oled-s90d-qn65s90dafxza-550262130?$product-details-jpg$',
      alt: 'Samsung OLED TV',
    },
    icon: 'Tv',
    position: 3,
    isFeatured: true,
    productCount: 19,
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
    productCount: 33,
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
    productCount: 35,
  }),

  makeCategory({
    id: 'c-headphones',
    name: 'Headphones',
    slug: 'headphones',
    parentId: 'c-accessories',
    ancestors: ['c-accessories'],
    level: 1,
    position: 1,
    productCount: 12,
  }),
  makeCategory({
    id: 'c-wearables',
    name: 'Wearables',
    slug: 'wearables',
    parentId: 'c-accessories',
    ancestors: ['c-accessories'],
    level: 1,
    position: 2,
    productCount: 8,
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
    productCount: 10,
  }),
  makeCategory({
    id: 'c-gpus',
    name: 'GPUs',
    slug: 'gpus',
    parentId: 'c-components',
    ancestors: ['c-components'],
    level: 1,
    position: 2,
    productCount: 8,
  }),

  makeCategory({
    id: 'c-phones-iphone',
    name: 'iPhones',
    slug: 'phones-iphone',
    parentId: 'c-phones',
    ancestors: ['c-phones'],
    level: 1,
    description: 'Latest Apple iPhone — Pro, Plus, and SE models with A-series chips and iOS.',
    icon: 'Smartphone',
    position: 1,
    productCount: 6,
  }),
  makeCategory({
    id: 'c-phones-samsung',
    name: 'Samsung Phones',
    slug: 'phones-samsung',
    parentId: 'c-phones',
    ancestors: ['c-phones'],
    level: 1,
    description:
      'Samsung Galaxy S25, Z Fold, Z Flip, and A-series — flagship Android with Galaxy AI.',
    icon: 'Smartphone',
    position: 2,
    productCount: 7,
  }),
  makeCategory({
    id: 'c-phones-infinix',
    name: 'Infinix Phones',
    slug: 'phones-infinix',
    parentId: 'c-phones',
    ancestors: ['c-phones'],
    level: 1,
    description:
      'Infinix GT, Note, Hot, and Smart series — high-performance and budget-friendly Android phones.',
    icon: 'Smartphone',
    position: 3,
    productCount: 4,
  }),
  makeCategory({
    id: 'c-phones-tecno',
    name: 'Tecno Phones',
    slug: 'phones-tecno',
    parentId: 'c-phones',
    ancestors: ['c-phones'],
    level: 1,
    description:
      'Tecno Camon, Pova, Spark, and Phantom — camera-focused and gaming Android smartphones.',
    icon: 'Smartphone',
    position: 4,
    productCount: 4,
  }),
  makeCategory({
    id: 'c-phones-honor',
    name: 'Honor Phones',
    slug: 'phones-honor',
    parentId: 'c-phones',
    ancestors: ['c-phones'],
    level: 1,
    description:
      'Honor Magic, 200, and X series — AI-powered cameras, premium displays, and strong battery life.',
    icon: 'Smartphone',
    position: 5,
    productCount: 4,
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
