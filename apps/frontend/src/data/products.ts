import type { Product, ProductSpecification } from '@twinspire/types';

/* eslint-disable @typescript-eslint/consistent-type-definitions */

const now = '2026-01-01T00:00:00.000Z';

interface ProductSeed {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  primaryCategoryId: string;
  categoryIds: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  price: { amount: number; compareAtAmount?: number; currency: 'USD' };
  images: { url: string; alt: string }[];
  rating: { average: number; count: number };
  stockStatus: Product['stockStatus'];
  condition?: Product['condition'];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  releaseDate?: string;
  specifications: ProductSpecification[];
  attributes?: { name: string; value: string }[];
}

function fillRating(avg: number, count: number) {
  const fives = Math.round(count * (avg >= 4.7 ? 0.78 : avg >= 4.4 ? 0.62 : avg >= 4 ? 0.5 : 0.4));
  const fours = Math.round(count * (avg >= 4.7 ? 0.16 : avg >= 4.4 ? 0.25 : avg >= 4 ? 0.3 : 0.28));
  const threes = Math.round(count * 0.08);
  const twos = Math.round(count * 0.03);
  const ones = Math.max(0, count - fives - fours - threes - twos);
  return {
    average: avg,
    count,
    distribution: { '1': ones, '2': twos, '3': threes, '4': fours, '5': fives },
  };
}

function expand(seed: ProductSeed): Product {
  const compareAt = seed.price.compareAtAmount;
  const discountPercent = compareAt
    ? Math.round(((compareAt - seed.price.amount) / compareAt) * 100)
    : undefined;
  return {
    id: seed.id,
    sku: seed.sku,
    name: seed.name,
    slug: seed.slug,
    shortDescription: seed.shortDescription,
    description: seed.description,
    brandId: seed.brandId,
    brandName: seed.brandName,
    primaryCategoryId: seed.primaryCategoryId,
    categoryIds: seed.categoryIds,
    tags: seed.tags,
    condition: seed.condition ?? 'new',
    status: 'published',
    stockStatus: seed.stockStatus,
    price: { ...seed.price, discountPercent },
    images: seed.images.map((img, i) => ({
      url: img.url,
      alt: img.alt,
      width: 1200,
      height: 1500,
      position: i,
    })),
    attributes:
      seed.attributes?.map((a, i) => ({
        attributeId: `attr-${seed.id}-${i}`,
        name: a.name,
        slug: a.name.toLowerCase().replace(/\s+/g, '-'),
        value: a.value,
      })) ?? [],
    specifications: seed.specifications,
    variants: [],
    hasVariants: false,
    rating: fillRating(seed.rating.average, seed.rating.count),
    isFeatured: seed.isFeatured ?? false,
    isBestSeller: seed.isBestSeller ?? false,
    isNewArrival: seed.isNewArrival ?? false,
    releaseDate: seed.releaseDate,
    createdAt: now,
    updatedAt: now,
  };
}

const SEEDS: ProductSeed[] = [
  {
    id: 'p-aurora-x-pro',
    sku: 'AUR-XPRO-001',
    name: 'Aurora X Pro — Wireless Over-Ear Headphones',
    slug: 'aurora-x-pro-headphones',
    brandId: 'b-aurora',
    brandName: 'Aurora Audio',
    primaryCategoryId: 'c-headphones',
    categoryIds: ['c-accessories', 'c-headphones'],
    tags: ['audio', 'noise-cancelling', 'wireless'],
    shortDescription: 'Reference-grade ANC headphones with 60-hour battery and lossless USB-C audio.',
    description:
      'The Aurora X Pro is our flagship reference headphone — hand-tuned in Copenhagen with 40 mm beryllium drivers, adaptive ANC, and 60 hours of playback. Includes a hardshell case, balanced cable, and lifetime ear-cushion replacements.',
    price: { amount: 249, compareAtAmount: 349, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=1200&q=70', alt: 'Headphones front' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=70', alt: 'Headphones detail' },
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=70', alt: 'Headphones in case' },
    ],
    rating: { average: 4.8, count: 1284 },
    stockStatus: 'in_stock',
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    releaseDate: '2025-09-12',
    specifications: [
      { group: 'Audio', key: 'Driver', value: '40 mm beryllium dome', position: 1 },
      { group: 'Audio', key: 'Frequency response', value: '4 Hz – 40 kHz', position: 2 },
      { group: 'Audio', key: 'Impedance', value: '32 Ω', position: 3 },
      { group: 'Battery', key: 'Playback (ANC on)', value: '60 hours', position: 1 },
      { group: 'Battery', key: 'Quick charge', value: '10 min = 5 hours', position: 2 },
      { group: 'Connectivity', key: 'Bluetooth', value: '5.3, LE Audio, LDAC', position: 1 },
      { group: 'Connectivity', key: 'USB', value: 'USB-C lossless audio', position: 2 },
    ],
    attributes: [
      { name: 'Color', value: 'Midnight' },
      { name: 'Weight', value: '255 g' },
    ],
  },
  {
    id: 'p-nimbus-14',
    sku: 'NIM-14-001',
    name: 'Nimbus 14 — Ultraportable Laptop',
    slug: 'nimbus-14-laptop',
    brandId: 'b-nimbus',
    brandName: 'Nimbus',
    primaryCategoryId: 'c-laptops',
    categoryIds: ['c-laptops'],
    tags: ['laptops', 'ultrabook', 'creator'],
    shortDescription: '14" 3K OLED, 18-core neural CPU, 2 lb chassis, 22-hour battery.',
    description:
      'Built for creators who travel light. The Nimbus 14 packs a calibrated 3K OLED display, an 18-core silicon, and 22 hours of mixed-use battery into a 1.9 lb magnesium chassis. Whisper-quiet fans, MagSafe-style charging, and four Thunderbolt 4 ports.',
    price: { amount: 1299, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=70', alt: 'Open laptop' },
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=70', alt: 'Laptop keyboard' },
      { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=70', alt: 'Laptop side' },
    ],
    rating: { average: 4.6, count: 412 },
    stockStatus: 'low_stock',
    isFeatured: true,
    isNewArrival: true,
    releaseDate: '2026-01-15',
    specifications: [
      { group: 'Display', key: 'Size', value: '14" 3K OLED', position: 1 },
      { group: 'Display', key: 'Refresh', value: '120 Hz', position: 2 },
      { group: 'Display', key: 'Brightness', value: '1100 nits HDR', position: 3 },
      { group: 'Performance', key: 'CPU', value: 'Quanta Neural Q18', position: 1 },
      { group: 'Performance', key: 'GPU', value: 'Integrated Quanta Iris', position: 2 },
      { group: 'Performance', key: 'Memory', value: '16/24/32 GB LPDDR5X', position: 3 },
      { group: 'Performance', key: 'Storage', value: '512 GB – 4 TB NVMe', position: 4 },
      { group: 'Battery', key: 'Capacity', value: '70 Wh', position: 1 },
      { group: 'Battery', key: 'Charge', value: '140 W USB-C', position: 2 },
    ],
  },
  {
    id: 'p-pulse-4k',
    sku: 'PUL-MN-4K32',
    name: 'Pulse 4K HDR Gaming Monitor 32"',
    slug: 'pulse-4k-monitor-32',
    brandId: 'b-pulse',
    brandName: 'Pulse',
    primaryCategoryId: 'c-monitors',
    categoryIds: ['c-gaming', 'c-monitors'],
    tags: ['gaming', 'monitor', '4k'],
    shortDescription: '32" 4K 240 Hz QD-OLED, 1500 nits HDR, DisplayPort 2.1.',
    description:
      'The Pulse 32" QD-OLED hits 240 Hz at native 4K with 0.03 ms response and DisplayPort 2.1 UHBR20. KVM, USB-C 90 W charging, and a height-adjustable stand included.',
    price: { amount: 599, compareAtAmount: 749, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=70', alt: 'Monitor front' },
      { url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=70', alt: 'Monitor angle' },
    ],
    rating: { average: 4.4, count: 96 },
    stockStatus: 'in_stock',
    isBestSeller: true,
    specifications: [
      { group: 'Display', key: 'Panel', value: '32" QD-OLED', position: 1 },
      { group: 'Display', key: 'Resolution', value: '3840 × 2160', position: 2 },
      { group: 'Display', key: 'Refresh rate', value: '240 Hz', position: 3 },
      { group: 'Display', key: 'Response', value: '0.03 ms GtG', position: 4 },
      { group: 'Display', key: 'HDR', value: 'HDR1500 (1500 nits peak)', position: 5 },
      { group: 'Connectivity', key: 'DisplayPort', value: 'DP 2.1 UHBR20', position: 1 },
      { group: 'Connectivity', key: 'HDMI', value: '2× HDMI 2.1', position: 2 },
      { group: 'Connectivity', key: 'USB-C', value: '90 W PD, DP-alt', position: 3 },
    ],
  },
  {
    id: 'p-orbit-ring',
    sku: 'ORB-RNG-001',
    name: 'Orbit Smart Ring — Sleep & Activity',
    slug: 'orbit-smart-ring',
    brandId: 'b-orbit',
    brandName: 'Orbit',
    primaryCategoryId: 'c-wearables',
    categoryIds: ['c-accessories', 'c-wearables'],
    tags: ['wearables', 'health'],
    shortDescription: 'Titanium smart ring, 7-day battery, no subscription.',
    description:
      'Track sleep, recovery, HRV, SpO2, and 30+ activities from a 4 g titanium ring. Encrypted on-device storage, no cloud lock-in, no subscription. Pairs with iOS and Android.',
    price: { amount: 179, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=70', alt: 'Smart ring' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=70', alt: 'Ring detail' },
    ],
    rating: { average: 4.2, count: 38 },
    stockStatus: 'preorder',
    isNewArrival: true,
    releaseDate: '2026-03-01',
    specifications: [
      { group: 'Sensors', key: 'Heart rate', value: 'PPG, 24/7', position: 1 },
      { group: 'Sensors', key: 'SpO2', value: 'Yes', position: 2 },
      { group: 'Sensors', key: 'Temperature', value: 'Skin temp variance', position: 3 },
      { group: 'Battery', key: 'Life', value: 'Up to 7 days', position: 1 },
      { group: 'Battery', key: 'Charge time', value: '60 min', position: 2 },
      { group: 'Build', key: 'Material', value: 'Aerospace titanium', position: 1 },
      { group: 'Build', key: 'Water resistance', value: '10 ATM', position: 2 },
    ],
  },
  {
    id: 'p-helix-fold',
    sku: 'HLX-FLD-002',
    name: 'Helix Fold Z2 — Foldable Smartphone',
    slug: 'helix-fold-z2',
    brandId: 'b-helix',
    brandName: 'Helix',
    primaryCategoryId: 'c-phones',
    categoryIds: ['c-phones'],
    tags: ['phones', 'foldable', '5g'],
    shortDescription: '8" inner foldable, 200 MP periscope, AI translate.',
    description:
      'A book-style foldable with a 7.8" 120 Hz LTPO inner display, ceramic UTG hinge, and a 200 MP periscope sensor. Encrypted on-device AI translation in 47 languages.',
    price: { amount: 1799, compareAtAmount: 1999, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=70', alt: 'Phone front' },
      { url: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=1200&q=70', alt: 'Phone open' },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=70', alt: 'Phone detail' },
    ],
    rating: { average: 4.5, count: 256 },
    stockStatus: 'in_stock',
    isFeatured: true,
    isNewArrival: true,
    releaseDate: '2025-11-04',
    specifications: [
      { group: 'Display', key: 'Inner', value: '7.8" 120 Hz LTPO', position: 1 },
      { group: 'Display', key: 'Outer', value: '6.3" 120 Hz', position: 2 },
      { group: 'Camera', key: 'Main', value: '50 MP f/1.7 OIS', position: 1 },
      { group: 'Camera', key: 'Periscope', value: '200 MP 5× optical', position: 2 },
      { group: 'Camera', key: 'Ultrawide', value: '12 MP f/2.2', position: 3 },
      { group: 'Performance', key: 'Chipset', value: 'Helix Neural N9', position: 1 },
      { group: 'Performance', key: 'RAM', value: '12/16 GB', position: 2 },
      { group: 'Battery', key: 'Capacity', value: '4800 mAh', position: 1 },
    ],
  },
  {
    id: 'p-helix-pro',
    sku: 'HLX-PRO-009',
    name: 'Helix Pro 9 — 6.7" Flagship Phone',
    slug: 'helix-pro-9',
    brandId: 'b-helix',
    brandName: 'Helix',
    primaryCategoryId: 'c-phones',
    categoryIds: ['c-phones'],
    tags: ['phones', '5g', 'camera'],
    shortDescription: 'Periscope zoom + cinematic 8K video + LTPO 2.0.',
    price: { amount: 1099, currency: 'USD' },
    description:
      'The Helix Pro 9 is a no-compromise flagship — Neural N9 silicon, a triple-camera array with 5× periscope, and 8K30 ProRes recording.',
    images: [
      { url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=70', alt: 'Phone back' },
      { url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1200&q=70', alt: 'Phone detail' },
    ],
    rating: { average: 4.7, count: 642 },
    stockStatus: 'in_stock',
    isBestSeller: true,
    specifications: [
      { group: 'Display', key: 'Size', value: '6.7" LTPO OLED', position: 1 },
      { group: 'Display', key: 'Refresh', value: '120 Hz', position: 2 },
      { group: 'Performance', key: 'Chipset', value: 'Helix Neural N9', position: 1 },
      { group: 'Performance', key: 'RAM/Storage', value: '12 GB / 256 GB–1 TB', position: 2 },
      { group: 'Battery', key: 'Capacity', value: '5200 mAh', position: 1 },
    ],
  },
  {
    id: 'p-monolith-oled',
    sku: 'MON-OLED-77',
    name: 'Monolith 77" OLED Cinema TV',
    slug: 'monolith-77-oled-tv',
    brandId: 'b-monolith',
    brandName: 'Monolith',
    primaryCategoryId: 'c-tvs',
    categoryIds: ['c-tvs'],
    tags: ['tvs', 'oled', '4k'],
    shortDescription: '77" 4K 120 Hz OLED with reference-mode calibration.',
    description:
      'The Monolith 77" OLED ships pre-calibrated to Filmmaker Mode out of the box. Dolby Vision IQ, HDMI 2.1 (4× ports), 144 Hz VRR for gaming, and a Dolby Atmos 5.1.2 speaker system.',
    price: { amount: 2499, compareAtAmount: 2999, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=70', alt: 'TV in living room' },
      { url: 'https://images.unsplash.com/photo-1551817958-c5b51e7b4a33?auto=format&fit=crop&w=1200&q=70', alt: 'TV detail' },
    ],
    rating: { average: 4.7, count: 188 },
    stockStatus: 'in_stock',
    isFeatured: true,
    specifications: [
      { group: 'Display', key: 'Size', value: '77"', position: 1 },
      { group: 'Display', key: 'Panel', value: 'OLED evo', position: 2 },
      { group: 'Display', key: 'Resolution', value: '3840 × 2160', position: 3 },
      { group: 'Display', key: 'Refresh', value: '120 Hz (144 Hz VRR)', position: 4 },
      { group: 'Audio', key: 'System', value: '5.1.2 Dolby Atmos', position: 1 },
      { group: 'HDR', key: 'Formats', value: 'Dolby Vision IQ, HDR10+, HLG', position: 1 },
      { group: 'Gaming', key: 'HDMI', value: '4× HDMI 2.1, ALLM', position: 1 },
    ],
  },
  {
    id: 'p-quanta-q18',
    sku: 'QNT-Q18-01',
    name: 'Quanta Q18 — Desktop CPU',
    slug: 'quanta-q18-cpu',
    brandId: 'b-quanta',
    brandName: 'Quanta',
    primaryCategoryId: 'c-cpus',
    categoryIds: ['c-components', 'c-cpus'],
    tags: ['components', 'cpu'],
    shortDescription: '18-core, 36-thread desktop CPU. 5.7 GHz boost.',
    description:
      'Built on 3 nm with a 256 MB stacked cache, the Q18 dominates productivity and gaming. PCIe 5.0, ECC support, and 65 W TDP.',
    price: { amount: 549, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=70', alt: 'CPU socket' },
    ],
    rating: { average: 4.6, count: 79 },
    stockStatus: 'in_stock',
    isBestSeller: true,
    specifications: [
      { group: 'CPU', key: 'Cores / Threads', value: '18 / 36', position: 1 },
      { group: 'CPU', key: 'Base / Boost', value: '3.6 / 5.7 GHz', position: 2 },
      { group: 'CPU', key: 'TDP', value: '65 W', position: 3 },
      { group: 'Cache', key: 'L3', value: '256 MB stacked', position: 1 },
    ],
  },
  {
    id: 'p-quanta-rtx',
    sku: 'QNT-GPU-X9',
    name: 'Quanta GPU X9 — 24 GB GDDR7',
    slug: 'quanta-gpu-x9',
    brandId: 'b-quanta',
    brandName: 'Quanta',
    primaryCategoryId: 'c-gpus',
    categoryIds: ['c-components', 'c-gpus'],
    tags: ['components', 'gpu', '4k'],
    shortDescription: '24 GB GDDR7, 4K 240 Hz, AI super-resolution.',
    description:
      'The X9 melts 4K ray-traced workloads with 24 GB GDDR7 and frame-generation tech tuned for esports latency.',
    price: { amount: 1599, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=1200&q=70', alt: 'GPU' },
    ],
    rating: { average: 4.5, count: 41 },
    stockStatus: 'low_stock',
    isFeatured: true,
    specifications: [
      { group: 'GPU', key: 'CUDA-class cores', value: '18,432', position: 1 },
      { group: 'GPU', key: 'Memory', value: '24 GB GDDR7', position: 2 },
      { group: 'GPU', key: 'TGP', value: '320 W', position: 3 },
    ],
  },
  {
    id: 'p-pulse-kb',
    sku: 'PUL-KB-V2',
    name: 'Pulse Velocity 75 — Aluminum Mechanical Keyboard',
    slug: 'pulse-velocity-75',
    brandId: 'b-pulse',
    brandName: 'Pulse',
    primaryCategoryId: 'c-keyboards',
    categoryIds: ['c-gaming', 'c-keyboards'],
    tags: ['gaming', 'keyboard'],
    shortDescription: '75% layout, hot-swap, gasket mount, magnetic switches.',
    description:
      'A hot-swap aluminum 75% keyboard with magnetic Hall-effect switches, gasket mount, and per-key RGB. USB-C and 2.4 GHz wireless.',
    price: { amount: 189, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=70', alt: 'Keyboard' },
      { url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=70', alt: 'Keyboard side' },
    ],
    rating: { average: 4.7, count: 312 },
    stockStatus: 'in_stock',
    isBestSeller: true,
    specifications: [
      { group: 'Build', key: 'Layout', value: '75% (80 keys)', position: 1 },
      { group: 'Build', key: 'Material', value: 'CNC aluminum', position: 2 },
      { group: 'Switches', key: 'Type', value: 'Magnetic Hall-effect', position: 1 },
      { group: 'Connectivity', key: 'Modes', value: 'USB-C, 2.4 GHz, BLE 5.3', position: 1 },
    ],
  },
  {
    id: 'p-nimbus-16',
    sku: 'NIM-16-001',
    name: 'Nimbus 16 Studio — Creator Laptop',
    slug: 'nimbus-16-studio',
    brandId: 'b-nimbus',
    brandName: 'Nimbus',
    primaryCategoryId: 'c-laptops',
    categoryIds: ['c-laptops'],
    tags: ['laptops', 'creator'],
    shortDescription: '16" mini-LED, RTX-class GPU, 64 GB RAM ceiling.',
    description:
      'A workstation-class laptop with calibrated 16" mini-LED, RTX-class discrete GPU, and 64 GB ceiling. Color-accurate out of the box.',
    price: { amount: 2299, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=70', alt: 'Laptop closed' },
    ],
    rating: { average: 4.5, count: 86 },
    stockStatus: 'in_stock',
    isFeatured: true,
    specifications: [
      { group: 'Display', key: 'Size', value: '16" mini-LED 240 Hz', position: 1 },
      { group: 'Performance', key: 'CPU', value: 'Quanta Q18 mobile', position: 1 },
      { group: 'Performance', key: 'GPU', value: 'Quanta GPU X8M', position: 2 },
    ],
  },
  {
    id: 'p-relay-mesh',
    sku: 'RLY-MSH-3PK',
    name: 'Relay Mesh — Wi-Fi 7 3-Pack',
    slug: 'relay-mesh-wifi-7',
    brandId: 'b-relay',
    brandName: 'Relay',
    primaryCategoryId: 'c-accessories',
    categoryIds: ['c-accessories'],
    tags: ['networking', 'wifi-7'],
    shortDescription: '6,000 sq ft Wi-Fi 7, 10 Gb backhaul.',
    description:
      'Three node Wi-Fi 7 system with dedicated 10 Gb wired backhaul, multi-link operation, and a no-cloud admin panel.',
    price: { amount: 699, compareAtAmount: 799, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=70', alt: 'Wi-Fi node' },
    ],
    rating: { average: 4.3, count: 64 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Network', key: 'Wi-Fi', value: 'Wi-Fi 7 (6 GHz, MLO)', position: 1 },
      { group: 'Network', key: 'Backhaul', value: '10 Gb wired', position: 2 },
      { group: 'Coverage', key: 'Sq ft', value: 'Up to 6,000', position: 1 },
    ],
  },
  {
    id: 'p-vector-drone',
    sku: 'VEC-DR-2',
    name: 'Vector Mini 2 — Cinema Drone',
    slug: 'vector-mini-2-drone',
    brandId: 'b-vector',
    brandName: 'Vector',
    primaryCategoryId: 'c-accessories',
    categoryIds: ['c-accessories'],
    tags: ['drones', 'photography'],
    shortDescription: '4/3 sensor, ProRes RAW, 35 min flight time.',
    description:
      'A 249 g drone with a 4/3 stacked sensor, ProRes RAW recording, and 35 min flight time. Smart return-to-home and obstacle avoidance.',
    price: { amount: 1499, currency: 'USD' },
    images: [
      { url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=70', alt: 'Drone in flight' },
      { url: 'https://images.unsplash.com/photo-1508614999368-9260051292e5?auto=format&fit=crop&w=1200&q=70', alt: 'Drone detail' },
    ],
    rating: { average: 4.4, count: 27 },
    stockStatus: 'in_stock',
    isNewArrival: true,
    releaseDate: '2026-02-04',
    specifications: [
      { group: 'Imaging', key: 'Sensor', value: '4/3 stacked CMOS', position: 1 },
      { group: 'Imaging', key: 'Recording', value: '5.4K ProRes RAW', position: 2 },
      { group: 'Flight', key: 'Time', value: 'Up to 35 min', position: 1 },
    ],
  },
  {
    id: 'p-aurora-earbuds',
    sku: 'AUR-EAR-V3',
    name: 'Aurora Buds V3 — ANC Earbuds',
    slug: 'aurora-buds-v3',
    brandId: 'b-aurora',
    brandName: 'Aurora Audio',
    primaryCategoryId: 'c-headphones',
    categoryIds: ['c-accessories', 'c-headphones'],
    tags: ['audio', 'earbuds', 'wireless'],
    shortDescription: 'Compact ANC earbuds. 36 hours w/ case. Lossless 24-bit.',
    price: { amount: 149, compareAtAmount: 179, currency: 'USD' },
    description:
      'Compact in-ear ANC earbuds with adaptive noise cancellation, lossless 24-bit audio over Bluetooth LE Audio, and 36 hours of battery with the case.',
    images: [
      { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=70', alt: 'Earbuds with case' },
      { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=70', alt: 'Earbuds detail' },
    ],
    rating: { average: 4.5, count: 503 },
    stockStatus: 'in_stock',
    isBestSeller: true,
    specifications: [
      { group: 'Audio', key: 'Driver', value: '11 mm dynamic', position: 1 },
      { group: 'Battery', key: 'With case', value: '36 hours', position: 1 },
      { group: 'Connectivity', key: 'Bluetooth', value: '5.3 LE Audio, LDAC', position: 1 },
    ],
  },
  {
    id: 'p-pulse-mouse',
    sku: 'PUL-MS-1',
    name: 'Pulse Vector Mouse',
    slug: 'pulse-vector-mouse',
    brandId: 'b-pulse',
    brandName: 'Pulse',
    primaryCategoryId: 'c-gaming',
    categoryIds: ['c-gaming'],
    tags: ['gaming', 'mouse'],
    shortDescription: '54 g, 8 kHz polling, 36k DPI.',
    price: { amount: 129, currency: 'USD' },
    description:
      'Ultralight 54 g gaming mouse with an 8 kHz polling rate, 36k DPI sensor, and optical switches rated for 100M clicks.',
    images: [
      { url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=70', alt: 'Gaming mouse' },
    ],
    rating: { average: 4.6, count: 215 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Performance', key: 'DPI', value: '36,000', position: 1 },
      { group: 'Performance', key: 'Polling', value: '8 kHz', position: 2 },
      { group: 'Build', key: 'Weight', value: '54 g', position: 1 },
    ],
  },
  {
    id: 'p-monolith-sb',
    sku: 'MON-SB-11',
    name: 'Monolith Theater Soundbar 9.1.4',
    slug: 'monolith-theater-soundbar',
    brandId: 'b-monolith',
    brandName: 'Monolith',
    primaryCategoryId: 'c-tvs',
    categoryIds: ['c-tvs'],
    tags: ['audio', 'soundbar', 'home-theater'],
    shortDescription: '9.1.4 Dolby Atmos soundbar, wireless sub + rears.',
    price: { amount: 1199, currency: 'USD' },
    description:
      '14-channel soundbar with wireless 10" sub and rear surrounds. Trueplay room correction, eARC, Wi-Fi multi-room.',
    images: [
      { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=70', alt: 'Soundbar' },
    ],
    rating: { average: 4.6, count: 102 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Audio', key: 'Channels', value: '9.1.4', position: 1 },
      { group: 'Audio', key: 'Power', value: '900 W RMS', position: 2 },
      { group: 'Connectivity', key: 'HDMI', value: '2× HDMI 2.1, eARC', position: 1 },
    ],
  },
  {
    id: 'p-pulse-2k',
    sku: 'PUL-MN-2K27',
    name: 'Pulse 2K Esports Monitor 27"',
    slug: 'pulse-2k-monitor-27',
    brandId: 'b-pulse',
    brandName: 'Pulse',
    primaryCategoryId: 'c-monitors',
    categoryIds: ['c-gaming', 'c-monitors'],
    tags: ['gaming', 'monitor', '2k'],
    shortDescription: '27" 2K 360 Hz IPS, 1 ms, latency analyzer.',
    price: { amount: 449, currency: 'USD' },
    description:
      '27" 2560 × 1440 IPS at 360 Hz with 1 ms response, USB-C 90 W, KVM, and a built-in input latency analyzer.',
    images: [
      { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=70', alt: 'Esports monitor' },
    ],
    rating: { average: 4.5, count: 73 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Display', key: 'Resolution', value: '2560 × 1440', position: 1 },
      { group: 'Display', key: 'Refresh rate', value: '360 Hz', position: 2 },
      { group: 'Connectivity', key: 'USB-C', value: '90 W PD', position: 1 },
    ],
  },
  {
    id: 'p-kindle-air',
    sku: 'KND-AIR-01',
    name: 'Kindle Air — 7" E-Ink Reader',
    slug: 'kindle-air',
    brandId: 'b-kindle',
    brandName: 'Kindle',
    primaryCategoryId: 'c-accessories',
    categoryIds: ['c-accessories'],
    tags: ['reading', 'eink'],
    shortDescription: '7" 300 PPI color e-ink, 7-week battery.',
    price: { amount: 219, currency: 'USD' },
    description:
      "A 7-inch 300 PPI color e-ink reader with adjustable warm lighting and a 7-week battery on a single charge.",
    images: [
      { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=70', alt: 'E-ink reader' },
    ],
    rating: { average: 4.4, count: 145 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Display', key: 'Size', value: '7" color e-ink', position: 1 },
      { group: 'Display', key: 'Resolution', value: '300 PPI', position: 2 },
      { group: 'Battery', key: 'Life', value: '7 weeks', position: 1 },
    ],
  },
  {
    id: 'p-orbit-watch',
    sku: 'ORB-WT-S2',
    name: 'Orbit Watch S2 — Health Smartwatch',
    slug: 'orbit-watch-s2',
    brandId: 'b-orbit',
    brandName: 'Orbit',
    primaryCategoryId: 'c-wearables',
    categoryIds: ['c-accessories', 'c-wearables'],
    tags: ['wearables', 'health'],
    shortDescription: 'AMOLED, ECG, blood pressure, 18-day battery.',
    price: { amount: 349, compareAtAmount: 399, currency: 'USD' },
    description:
      'A health-focused smartwatch with FDA-cleared ECG, optical blood pressure trend, and a unique 18-day battery life.',
    images: [
      { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=70', alt: 'Smartwatch' },
    ],
    rating: { average: 4.5, count: 187 },
    stockStatus: 'in_stock',
    isFeatured: true,
    specifications: [
      { group: 'Display', key: 'Panel', value: '1.4" AMOLED 2,000 nits', position: 1 },
      { group: 'Health', key: 'ECG', value: 'FDA-cleared', position: 1 },
      { group: 'Battery', key: 'Life', value: 'Up to 18 days', position: 1 },
    ],
  },
  {
    id: 'p-helix-buds',
    sku: 'HLX-BUDS-1',
    name: 'Helix Buds Live — Open-Ear Earbuds',
    slug: 'helix-buds-live',
    brandId: 'b-helix',
    brandName: 'Helix',
    primaryCategoryId: 'c-headphones',
    categoryIds: ['c-accessories', 'c-headphones'],
    tags: ['audio', 'earbuds', 'wireless'],
    shortDescription: 'Open-ear design for runners. IP68. 32-hour battery.',
    price: { amount: 129, currency: 'USD' },
    description:
      'Open-ear earbuds engineered for running and cycling. IP68, 32-hour battery with case, multipoint Bluetooth.',
    images: [
      { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=70', alt: 'Buds' },
    ],
    rating: { average: 4.1, count: 53 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Audio', key: 'Driver', value: 'Open-ear directional', position: 1 },
      { group: 'Battery', key: 'With case', value: '32 hours', position: 1 },
    ],
  },
  {
    id: 'p-quanta-ssd',
    sku: 'QNT-SSD-4T',
    name: 'Quanta NVMe SSD — 4 TB PCIe 5.0',
    slug: 'quanta-pcie5-ssd-4tb',
    brandId: 'b-quanta',
    brandName: 'Quanta',
    primaryCategoryId: 'c-components',
    categoryIds: ['c-components'],
    tags: ['components', 'storage', 'ssd'],
    shortDescription: '14 GB/s read, 5-year warranty.',
    price: { amount: 399, currency: 'USD' },
    description: '4 TB PCIe 5.0 NVMe SSD with 14 GB/s sequential read, encrypted self-encrypting drive, 5-year warranty.',
    images: [
      { url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=1200&q=70', alt: 'M.2 SSD' },
    ],
    rating: { average: 4.7, count: 91 },
    stockStatus: 'in_stock',
    isBestSeller: true,
    specifications: [
      { group: 'Storage', key: 'Capacity', value: '4 TB', position: 1 },
      { group: 'Storage', key: 'Read', value: '14,000 MB/s', position: 2 },
      { group: 'Storage', key: 'Write', value: '12,000 MB/s', position: 3 },
    ],
  },
  {
    id: 'p-nimbus-tablet',
    sku: 'NIM-TAB-13',
    name: 'Nimbus Tab 13 — Pro Tablet',
    slug: 'nimbus-tab-13',
    brandId: 'b-nimbus',
    brandName: 'Nimbus',
    primaryCategoryId: 'c-laptops',
    categoryIds: ['c-laptops'],
    tags: ['tablets', 'creator'],
    shortDescription: '13" OLED, M-pen w/ haptics, magnetic keyboard.',
    price: { amount: 999, currency: 'USD' },
    description: 'A 13-inch OLED pro tablet with a haptic stylus and a detachable keyboard for creators on the move.',
    images: [
      { url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1200&q=70', alt: 'Tablet' },
    ],
    rating: { average: 4.3, count: 47 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Display', key: 'Size', value: '13" OLED', position: 1 },
      { group: 'Performance', key: 'CPU', value: 'Quanta Q12 mobile', position: 1 },
    ],
  },
  {
    id: 'p-monolith-projector',
    sku: 'MON-PR-01',
    name: 'Monolith Beam 4K Projector',
    slug: 'monolith-beam-4k-projector',
    brandId: 'b-monolith',
    brandName: 'Monolith',
    primaryCategoryId: 'c-tvs',
    categoryIds: ['c-tvs'],
    tags: ['projector', '4k'],
    shortDescription: '4K HDR ultra-short-throw, 3,500 lumens.',
    price: { amount: 3199, compareAtAmount: 3499, currency: 'USD' },
    description: 'Ultra-short-throw 4K HDR projector. 3,500 ANSI lumens, 120" image from 8" away.',
    images: [
      { url: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&w=1200&q=70', alt: 'Projector' },
    ],
    rating: { average: 4.4, count: 38 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Display', key: 'Resolution', value: '3840 × 2160', position: 1 },
      { group: 'Brightness', key: 'ANSI', value: '3,500 lumens', position: 1 },
    ],
  },
  {
    id: 'p-pulse-chair',
    sku: 'PUL-CHR-01',
    name: 'Pulse Apex Chair',
    slug: 'pulse-apex-chair',
    brandId: 'b-pulse',
    brandName: 'Pulse',
    primaryCategoryId: 'c-gaming',
    categoryIds: ['c-gaming'],
    tags: ['gaming', 'furniture'],
    shortDescription: 'Mesh ergonomic gaming chair with adaptive lumbar.',
    price: { amount: 549, currency: 'USD' },
    description: 'Pro-grade ergonomic mesh chair with adaptive lumbar, 4D armrests, and a 12-year warranty.',
    images: [
      { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=70', alt: 'Gaming chair' },
    ],
    rating: { average: 4.2, count: 64 },
    stockStatus: 'out_of_stock',
    specifications: [
      { group: 'Build', key: 'Material', value: 'Mesh + aluminum', position: 1 },
      { group: 'Warranty', key: 'Period', value: '12 years', position: 1 },
    ],
  },
  {
    id: 'p-quanta-ram',
    sku: 'QNT-RAM-64',
    name: 'Quanta DDR5 RAM — 64 GB Kit',
    slug: 'quanta-ddr5-64gb-kit',
    brandId: 'b-quanta',
    brandName: 'Quanta',
    primaryCategoryId: 'c-components',
    categoryIds: ['c-components'],
    tags: ['components', 'ram'],
    shortDescription: 'DDR5-7600 64 GB (2×32) RGB.',
    price: { amount: 269, currency: 'USD' },
    description: 'DDR5-7600 CL36 RGB kit, lifetime warranty.',
    images: [
      { url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=70', alt: 'RAM' },
    ],
    rating: { average: 4.5, count: 28 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Memory', key: 'Capacity', value: '64 GB (2×32)', position: 1 },
      { group: 'Memory', key: 'Speed', value: 'DDR5-7600', position: 2 },
    ],
  },
  {
    id: 'p-relay-nas',
    sku: 'RLY-NAS-4',
    name: 'Relay NAS 4-Bay',
    slug: 'relay-nas-4-bay',
    brandId: 'b-relay',
    brandName: 'Relay',
    primaryCategoryId: 'c-accessories',
    categoryIds: ['c-accessories'],
    tags: ['storage', 'nas'],
    shortDescription: '4-bay NAS w/ 10 Gb, transcoding GPU.',
    price: { amount: 899, currency: 'USD' },
    description: '4-bay NAS with 10 Gb networking, hardware-accelerated transcoding, and free NAS OS updates for 7 years.',
    images: [
      { url: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=1200&q=70', alt: 'NAS box' },
    ],
    rating: { average: 4.6, count: 31 },
    stockStatus: 'in_stock',
    specifications: [
      { group: 'Bays', key: 'Count', value: '4 × 3.5"', position: 1 },
      { group: 'Network', key: 'Speed', value: '10 Gb + 2.5 Gb', position: 1 },
    ],
  },
];

export const products: Product[] = SEEDS.map(expand);

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryIds.includes(categoryId));
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];
  const sameBrand = products.filter(
    (p) => p.id !== productId && p.brandId === product.brandId,
  );
  const sameCategory = products.filter(
    (p) =>
      p.id !== productId &&
      p.brandId !== product.brandId &&
      p.categoryIds.some((id) => product.categoryIds.includes(id)),
  );
  return [...sameBrand, ...sameCategory].slice(0, limit);
}

export function getFeaturedProducts(limit = 6): Product[] {
  return products.filter((p) => p.isFeatured).slice(0, limit);
}

export function getBestSellers(limit = 8): Product[] {
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export function getNewArrivals(limit = 8): Product[] {
  return products
    .filter((p) => p.isNewArrival)
    .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''))
    .slice(0, limit);
}

export function getDeals(limit = 12): Product[] {
  return products
    .filter((p) => p.price.compareAtAmount && p.price.compareAtAmount > p.price.amount)
    .sort((a, b) => (b.price.discountPercent ?? 0) - (a.price.discountPercent ?? 0))
    .slice(0, limit);
}
