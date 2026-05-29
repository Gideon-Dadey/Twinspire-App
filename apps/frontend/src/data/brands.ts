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
      url: '/brands/aurora-audio.svg',
      alt: 'Aurora Audio',
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
      url: '/brands/nimbus.svg',
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
      url: '/brands/pulse.svg',
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
    logo: {
      url: '/brands/orbit.svg',
      alt: 'Orbit',
    },
    isFeatured: true,
    productCount: 6,
  }),
  makeBrand({
    id: 'b-helix',
    name: 'Helix',
    slug: 'helix',
    description: 'Flagship Android phones with cinema-grade cameras and modular battery packs.',
    logo: {
      url: '/brands/helix.svg',
      alt: 'Helix',
    },
    isFeatured: true,
    productCount: 8,
  }),
  makeBrand({
    id: 'b-quanta',
    name: 'Quanta',
    slug: 'quanta',
    description: 'Silicon-level innovation: CPUs, GPUs, and NVMe storage.',
    isFeatured: false,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-intel',
    name: 'Intel',
    slug: 'intel',
    description:
      'Core, Core Ultra, and Xeon processors — the foundation of gaming and workstation PCs worldwide.',
    logo: {
      url: '/brands/intel.svg',
      alt: 'Intel',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1968,
    isFeatured: true,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-amd',
    name: 'AMD',
    slug: 'amd',
    description:
      'Ryzen desktop CPUs and Radeon graphics — high core counts, 3D V-Cache, and RDNA gaming performance.',
    logo: {
      url: '/brands/amd.svg',
      alt: 'AMD',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1969,
    isFeatured: true,
    productCount: 5,
  }),
  makeBrand({
    id: 'b-corsair',
    name: 'Corsair',
    slug: 'corsair',
    description:
      'Vengeance DDR5 memory, RM power supplies, and premium PC components for builders.',
    logo: {
      url: '/brands/corsair.svg',
      alt: 'Corsair',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1994,
    isFeatured: false,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-kingston',
    name: 'Kingston',
    slug: 'kingston',
    description: 'Fury memory and NVMe storage — reliable DRAM and SSD for every build tier.',
    logo: {
      url: '/brands/kingston.svg',
      alt: 'Kingston',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1987,
    isFeatured: false,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-gskill',
    name: 'G.Skill',
    slug: 'gskill',
    description: 'Trident and Ripjaws DDR5 kits tuned for overclocking and enthusiast builds.',
    logo: {
      url: '/brands/gskill.svg',
      alt: 'G.Skill',
    },
    countryOfOrigin: 'Taiwan',
    foundedYear: 1989,
    isFeatured: false,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-wd',
    name: 'Western Digital',
    slug: 'western-digital',
    description: 'WD Black NVMe SSDs and storage for gaming, creators, and data centers.',
    logo: {
      url: '/brands/wd.svg',
      alt: 'Western Digital',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1970,
    isFeatured: false,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-monolith',
    name: 'Monolith',
    slug: 'monolith',
    description:
      'Cinema-grade OLED and QLED televisions, professionally calibrated out of the box.',
    logo: {
      url: '/brands/monolith.svg',
      alt: 'Monolith',
    },
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
      'iPhone, MacBook, and accessories built on Apple silicon. Industry-leading performance, iOS, and macOS integration.',
    logo: {
      url: '/brands/apple.svg',
      alt: 'Apple',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1976,
    isFeatured: true,
    productCount: 19,
  }),
  makeBrand({
    id: 'b-hp',
    name: 'HP',
    slug: 'hp',
    description:
      'Spectre ultrabooks, Omen gaming, and EliteBook business laptops. Engineered for premium performance and durability.',
    logo: {
      url: '/brands/hp.svg',
      alt: 'HP',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1939,
    isFeatured: true,
    productCount: 8,
  }),
  makeBrand({
    id: 'b-lenovo',
    name: 'Lenovo',
    slug: 'lenovo',
    description:
      'ThinkPad, Legion and Yoga lines. The gold standard for business reliability and gaming performance.',
    logo: {
      url: '/brands/lenovo.svg',
      alt: 'Lenovo',
    },
    countryOfOrigin: 'China',
    foundedYear: 1984,
    isFeatured: true,
    productCount: 6,
  }),
  makeBrand({
    id: 'b-dell',
    name: 'Dell',
    slug: 'dell',
    description:
      'XPS premium ultrabooks, Alienware gaming, and Latitude enterprise. Award-winning displays and build quality.',
    logo: {
      url: '/brands/dell.svg',
      alt: 'Dell',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1984,
    isFeatured: true,
    productCount: 5,
  }),
  makeBrand({
    id: 'b-samsung',
    name: 'Samsung',
    slug: 'samsung',
    description:
      'Galaxy smartphones, Galaxy Book laptops, OLED and Neo QLED TVs, and Q-Series Dolby Atmos soundbars.',
    logo: {
      url: '/brands/samsung.svg',
      alt: 'Samsung',
    },
    countryOfOrigin: 'South Korea',
    foundedYear: 1969,
    isFeatured: true,
    productCount: 23,
  }),
  makeBrand({
    id: 'b-microsoft',
    name: 'Microsoft',
    slug: 'microsoft',
    description:
      'Surface laptops and 2-in-1s — premium design, touch displays, and all-day productivity.',
    logo: {
      url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=200&q=70',
      alt: 'Microsoft',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1975,
    isFeatured: true,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-infinix',
    name: 'Infinix',
    slug: 'infinix',
    description:
      'Bold, affordable smartphones for Africa and beyond — GT gaming, Note, Hot, and Smart series with fast charging and big displays.',
    logo: {
      url: '/brands/infinix.svg',
      alt: 'Infinix',
    },
    countryOfOrigin: 'China',
    foundedYear: 2013,
    isFeatured: true,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-tecno',
    name: 'Tecno',
    slug: 'tecno',
    description:
      'Camera-first and gaming Android phones — Camon, Pova, Spark, and Phantom lines built for emerging markets.',
    logo: {
      url: '/brands/tecno.svg',
      alt: 'Tecno',
    },
    countryOfOrigin: 'China',
    foundedYear: 2006,
    isFeatured: true,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-honor',
    name: 'Honor',
    slug: 'honor',
    description:
      'AI-powered smartphones with premium displays and cameras — Magic flagships, portrait-focused 200 series, and durable X lineup.',
    logo: {
      url: '/brands/honor.svg',
      alt: 'Honor',
    },
    countryOfOrigin: 'China',
    foundedYear: 2013,
    isFeatured: true,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-asus',
    name: 'ASUS',
    slug: 'asus',
    description:
      'ROG gaming, Zenbook ultrabooks, and VivoBook everyday laptops — performance and value across every category.',
    logo: {
      url: '/brands/asus.svg',
      alt: 'ASUS',
    },
    countryOfOrigin: 'Taiwan',
    foundedYear: 1989,
    isFeatured: true,
    productCount: 14,
  }),
  makeBrand({
    id: 'b-acer',
    name: 'Acer',
    slug: 'acer',
    description:
      'Aspire everyday laptops, Swift ultrabooks, Nitro entry gaming, and Predator performance — reliable PCs for work and play.',
    logo: {
      url: '/brands/acer.svg',
      alt: 'Acer',
    },
    countryOfOrigin: 'Taiwan',
    foundedYear: 1976,
    isFeatured: true,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-msi',
    name: 'MSI',
    slug: 'msi',
    description:
      'Katana, Cyborg, and Raider gaming laptops — high-refresh displays, RTX graphics, and Cooler Boost thermal design.',
    logo: {
      url: 'https://dlcdnwebimgs.asus.com/gain/1C252331-C386-4050-A1CD-116D442F13AA/w200/h146',
      alt: 'MSI',
    },
    countryOfOrigin: 'Taiwan',
    foundedYear: 1986,
    isFeatured: true,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-lg',
    name: 'LG',
    slug: 'lg',
    description:
      'OLED evo and QNED TVs, StanbyME portable screens, and Dolby Atmos soundbars with WOW Orchestra.',
    logo: {
      url: '/brands/lg.svg',
      alt: 'LG',
    },
    countryOfOrigin: 'South Korea',
    foundedYear: 1958,
    isFeatured: true,
    productCount: 4,
  }),
  makeBrand({
    id: 'b-sony',
    name: 'Sony',
    slug: 'sony',
    description:
      'BRAVIA OLED and QD-OLED TVs with XR Cognitive Processor, plus home theater audio.',
    logo: {
      url: 'https://media.us.lg.com/m/452b59e0570d664e/webimage-MS_IT_SHOWCASE_LG_ULTRAGEAR_OLED-v2_1080X1080.png',
      alt: 'Sony',
    },
    countryOfOrigin: 'Japan',
    foundedYear: 1946,
    isFeatured: true,
    productCount: 3,
  }),
  makeBrand({
    id: 'b-tcl',
    name: 'TCL',
    slug: 'tcl',
    description:
      'QM and QLED Mini LED TVs with Google TV, ONKYO audio, and Game Accelerator — premium value.',
    logo: {
      url: 'https://cdn.shopify.com/s/files/1/0687/7151/2385/files/logo.png',
      alt: 'TCL',
    },
    countryOfOrigin: 'China',
    foundedYear: 1981,
    isFeatured: true,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-hisense',
    name: 'Hisense',
    slug: 'hisense',
    description:
      'ULED Mini-LED and Laser TV lineup — bright HDR, IMAX Enhanced, and Google TV smart platform.',
    logo: {
      url: 'https://static.wixstatic.com/media/506473_7fbd89d0a2ea4592bcaa1d1f7ed7788a~mv2.png/v1/fill/w_75,h_75,al_c,q_85/126390396d5fb40.png',
      alt: 'Hisense',
    },
    countryOfOrigin: 'China',
    foundedYear: 1969,
    isFeatured: true,
    productCount: 1,
  }),
  makeBrand({
    id: 'b-sonos',
    name: 'Sonos',
    slug: 'sonos',
    description:
      'Premium wireless speakers and Dolby Atmos soundbars with Trueplay tuning and multi-room audio.',
    logo: {
      url: 'https://media.us.lg.com/m/3ea91c548615f73a/webimage-MS_Sound-Suite_MiniContentCard_768x432-v3.png',
      alt: 'Sonos',
    },
    countryOfOrigin: 'United States',
    foundedYear: 2002,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-bose',
    name: 'Bose',
    slug: 'bose',
    description:
      'Smart soundbars and home theater with PhaseGuide surround, VoiceControl, and room calibration.',
    logo: {
      url: 'https://media.us.lg.com/m/4d40c2f3c4f1b7bd/webimage-2024_HE_SoundBarBundle_MiniCard_570x386.png',
      alt: 'Bose',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1964,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-jbl',
    name: 'JBL',
    slug: 'jbl',
    description:
      'Bar series Dolby Atmos soundbars with detachable wireless surrounds and PureVoice dialogue.',
    logo: {
      url: 'https://media.us.lg.com/m/25b8093fc1a67bc3/webimage-OBS_HE_SHOWCASE_AUDIO_THE_FUTURE_OF_SOUND_XBOOM_1080x1080.png',
      alt: 'JBL',
    },
    countryOfOrigin: 'United States',
    foundedYear: 1946,
    isFeatured: true,
    productCount: 2,
  }),
  makeBrand({
    id: 'b-logitech',
    name: 'Logitech',
    slug: 'logitech',
    description:
      'MX Master mice, MX Keys keyboards, and webcams — precision peripherals for creators and professionals.',
    logo: {
      url: '/brands/logitech.svg',
      alt: 'Logitech',
    },
    countryOfOrigin: 'Switzerland',
    foundedYear: 1981,
    isFeatured: true,
    productCount: 1,
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

const BRAND_STRIP_SLUGS = [
  'apple',
  'samsung',
  'hp',
  'lenovo',
  'dell',
  'asus',
  'acer',
  'lg',
  'infinix',
  'tecno',
  'honor',
  'aurora-audio',
  'nimbus',
  'pulse',
  'helix',
  'monolith',
] as const;

/** Homepage “Brands you trust” row — fixed roster in display order. */
export function getBrandStripBrands(): Brand[] {
  return BRAND_STRIP_SLUGS.map((slug) => getBrandBySlug(slug)).filter((b): b is Brand => b != null);
}
