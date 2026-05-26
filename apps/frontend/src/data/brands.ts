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
    logo: {
      url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=70',
      alt: 'Aurora',
    },
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
    logo: {
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=70',
      alt: 'Nimbus',
    },
    countryOfOrigin: 'United States',
    foundedYear: 2019,
    isFeatured: true,
    productCount: 9,
  }),
  makeBrand({
    id: 'b-pulse',
    name: 'Pulse',
    slug: 'pulse',
    description:
      'High-refresh gaming monitors, mechanical keyboards, and esports-grade peripherals.',
    logo: {
      url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=200&q=70',
      alt: 'Pulse',
    },
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
    description:
      'Cinema-grade OLED and QLED televisions, professionally calibrated out of the box.',
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
  makeBrand({
    id: 'b-apple',
    name: 'Apple',
    slug: 'apple',
    description:
      'MacBook, iMac and accessories built on Apple silicon. Industry-leading performance per watt with macOS.',
    logo: {
      url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=200&q=70',
      alt: 'Apple',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1976,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-hp',
    name: 'HP',
    slug: 'hp',
    description:
      'Spectre ultrabooks, Omen gaming, and EliteBook business laptops. Engineered for premium performance and durability.',
    logo: {
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=70',
      alt: 'HP',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1939,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-lenovo',
    name: 'Lenovo',
    slug: 'lenovo',
    description:
      'ThinkPad, Legion and Yoga lines. The gold standard for business reliability and gaming performance.',
    logo: {
      url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=70',
      alt: 'Lenovo',
    },
    countryOfOrigin: 'China',
    foundedYear: 1984,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-dell',
    name: 'Dell',
    slug: 'dell',
    description:
      'XPS premium ultrabooks, Alienware gaming, and Latitude enterprise. Award-winning displays and build quality.',
    logo: {
      url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=200&q=70',
      alt: 'Dell',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1984,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-samsung',
    name: 'Samsung',
    slug: 'samsung',
    description:
      'Galaxy Book ultraportables and creator laptops featuring vibrant Dynamic AMOLED 2X displays and Galaxy ecosystem integration.',
    logo: {
      url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=200&q=70',
      alt: 'Samsung',
    },
    countryOfOrigin: 'South Korea',
    foundedYear: 1969,
    isFeatured: true,
    productCount: 2,
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
