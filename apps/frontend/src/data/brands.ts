import type { Brand } from '@twinspire/types';

const now = '2026-01-01T00:00:00.000Z';

function makeBrand(input: Omit<Brand, 'createdAt' | 'updatedAt' | 'isActive'>): Brand {
  return {
    ...input,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

export const brands: Brand[] = [
  makeBrand({
    id: 'b-aurora',
    name: 'Aurora Audio',
    slug: 'aurora-audio',
    description:
      'Studio-grade headphones and speakers, hand-tuned in Copenhagen. Every Aurora device ships with a 5-year warranty.',
    logo: { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=70', alt: 'Aurora' },
    countryOfOrigin: 'Denmark',
    foundedYear: 2008,
    isFeatured: true,
    productCount: 12,
  }),
  makeBrand({
    id: 'b-nimbus',
    name: 'Nimbus',
    slug: 'nimbus',
    description: 'TwinSpire Labs flagship laptops. Whisper-quiet, AI-accelerated, built to last.',
    logo: { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=70', alt: 'Nimbus' },
    countryOfOrigin: 'United States',
    foundedYear: 2019,
    isFeatured: true,
    productCount: 9,
  }),
  makeBrand({
    id: 'b-pulse',
    name: 'Pulse',
    slug: 'pulse',
    description: 'High-refresh gaming monitors, mechanical keyboards, and esports-grade peripherals.',
    logo: { url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=200&q=70', alt: 'Pulse' },
    countryOfOrigin: 'Taiwan',
    foundedYear: 2014,
    isFeatured: true,
    productCount: 14,
  }),
  makeBrand({
    id: 'b-orbit',
    name: 'Orbit',
    slug: 'orbit',
    description: 'Pioneering wearables that disappear on your wrist and ring.',
    isFeatured: true,
    productCount: 6,
  }),
  makeBrand({
    id: 'b-helix',
    name: 'Helix',
    slug: 'helix',
    description: 'Flagship Android phones with cinema-grade cameras and modular battery packs.',
    isFeatured: true,
    productCount: 8,
  }),
  makeBrand({
    id: 'b-quanta',
    name: 'Quanta',
    slug: 'quanta',
    description: 'Silicon-level innovation: CPUs, GPUs, and NVMe storage.',
    isFeatured: false,
    productCount: 11,
  }),
  makeBrand({
    id: 'b-monolith',
    name: 'Monolith',
    slug: 'monolith',
    description: 'Cinema-grade OLED and QLED televisions, professionally calibrated out of the box.',
    isFeatured: true,
    productCount: 7,
  }),
  makeBrand({
    id: 'b-relay',
    name: 'Relay',
    slug: 'relay',
    description: 'Smart-home networking — mesh Wi-Fi, NAS, and edge routers.',
    isFeatured: false,
    productCount: 5,
  }),
  makeBrand({
    id: 'b-vector',
    name: 'Vector',
    slug: 'vector',
    description: 'Pro photography drones and gimbals.',
    isFeatured: false,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-kindle',
    name: 'Kindle',
    slug: 'kindle',
    description: 'E-ink readers with seven weeks of battery.',
    isFeatured: false,
    productCount: 3,
  }),
];

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getFeaturedBrands(limit = 8): Brand[] {
  return brands.filter((b) => b.isFeatured).slice(0, limit);
}
