/**
 * Static fixtures for seed scripts. Hand-curated so seed runs are
 * deterministic and the catalog reads like a real electronics retailer.
 */

export interface BrandFixture {
  name: string;
  slug: string;
  countryOfOrigin: string;
  foundedYear: number;
  isFeatured: boolean;
  description: string;
}

export const BRAND_FIXTURES: BrandFixture[] = [
  {
    name: 'Apple',
    slug: 'apple',
    countryOfOrigin: 'United States',
    foundedYear: 1976,
    isFeatured: true,
    description: 'Premium consumer electronics, software, and services.',
  },
  {
    name: 'Samsung',
    slug: 'samsung',
    countryOfOrigin: 'South Korea',
    foundedYear: 1938,
    isFeatured: true,
    description: 'Global leader in phones, displays, and components.',
  },
  {
    name: 'Sony',
    slug: 'sony',
    countryOfOrigin: 'Japan',
    foundedYear: 1946,
    isFeatured: true,
    description: 'Entertainment electronics, gaming, and imaging.',
  },
  {
    name: 'Dell',
    slug: 'dell',
    countryOfOrigin: 'United States',
    foundedYear: 1984,
    isFeatured: true,
    description: 'Business and consumer PCs, monitors, and servers.',
  },
  {
    name: 'HP',
    slug: 'hp',
    countryOfOrigin: 'United States',
    foundedYear: 1939,
    isFeatured: false,
    description: 'Laptops, desktops, printers, and accessories.',
  },
  {
    name: 'Lenovo',
    slug: 'lenovo',
    countryOfOrigin: 'China',
    foundedYear: 1984,
    isFeatured: true,
    description: 'Thinkpad, Legion, and Yoga laptop families.',
  },
  {
    name: 'ASUS',
    slug: 'asus',
    countryOfOrigin: 'Taiwan',
    foundedYear: 1989,
    isFeatured: true,
    description: 'Laptops, motherboards, GPUs, and ROG gaming gear.',
  },
  {
    name: 'LG',
    slug: 'lg',
    countryOfOrigin: 'South Korea',
    foundedYear: 1947,
    isFeatured: false,
    description: 'OLED TVs, home audio, and home appliances.',
  },
  {
    name: 'NVIDIA',
    slug: 'nvidia',
    countryOfOrigin: 'United States',
    foundedYear: 1993,
    isFeatured: true,
    description: 'GeForce GPUs and AI accelerators.',
  },
  {
    name: 'AMD',
    slug: 'amd',
    countryOfOrigin: 'United States',
    foundedYear: 1969,
    isFeatured: true,
    description: 'Ryzen CPUs and Radeon GPUs.',
  },
  {
    name: 'Intel',
    slug: 'intel',
    countryOfOrigin: 'United States',
    foundedYear: 1968,
    isFeatured: false,
    description: 'Core processors and platform components.',
  },
  {
    name: 'Bose',
    slug: 'bose',
    countryOfOrigin: 'United States',
    foundedYear: 1964,
    isFeatured: true,
    description: 'Premium headphones, speakers, and home audio.',
  },
];

export interface CategoryFixture {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isFeatured: boolean;
  children?: CategoryFixture[];
}

export const CATEGORY_FIXTURES: CategoryFixture[] = [
  {
    name: 'Phones',
    slug: 'phones',
    description: 'Flagship smartphones, foldables, and feature phones.',
    icon: 'Smartphone',
    isFeatured: true,
    children: [
      {
        name: 'iPhones',
        slug: 'phones-iphone',
        description: 'Apple iPhone family.',
        icon: 'Smartphone',
        isFeatured: true,
      },
      {
        name: 'Android Phones',
        slug: 'phones-android',
        description: 'Samsung, Pixel, and more.',
        icon: 'Smartphone',
        isFeatured: true,
      },
      {
        name: 'Foldables',
        slug: 'phones-foldables',
        description: 'Z Fold, Z Flip, and friends.',
        icon: 'Smartphone',
        isFeatured: false,
      },
    ],
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    description: 'Ultrabooks, gaming laptops, and mobile workstations.',
    icon: 'Laptop',
    isFeatured: true,
    children: [
      {
        name: 'Ultrabooks',
        slug: 'laptops-ultrabooks',
        description: 'Thin & light productivity laptops.',
        icon: 'Laptop',
        isFeatured: true,
      },
      {
        name: 'Gaming Laptops',
        slug: 'laptops-gaming',
        description: 'High-refresh, RTX-equipped powerhouses.',
        icon: 'Laptop',
        isFeatured: true,
      },
      {
        name: 'Workstations',
        slug: 'laptops-workstations',
        description: 'Pro creator and engineering rigs.',
        icon: 'Laptop',
        isFeatured: false,
      },
    ],
  },
  {
    name: 'TVs & Audio',
    slug: 'tvs',
    description: 'OLED, QLED, soundbars, and home theatre.',
    icon: 'Tv',
    isFeatured: true,
    children: [
      {
        name: 'OLED TVs',
        slug: 'tvs-oled',
        description: 'Perfect blacks, infinite contrast.',
        icon: 'Tv',
        isFeatured: true,
      },
      {
        name: 'QLED & LED',
        slug: 'tvs-qled',
        description: 'Bright, color-accurate panels.',
        icon: 'Tv',
        isFeatured: false,
      },
      {
        name: 'Soundbars',
        slug: 'tvs-soundbars',
        description: 'Dolby Atmos for every room.',
        icon: 'Speaker',
        isFeatured: false,
      },
    ],
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Consoles, GPUs, controllers, and accessories.',
    icon: 'Gamepad2',
    isFeatured: true,
    children: [
      {
        name: 'Consoles',
        slug: 'gaming-consoles',
        description: 'PlayStation, Xbox, Nintendo.',
        icon: 'Gamepad2',
        isFeatured: true,
      },
      {
        name: 'Controllers',
        slug: 'gaming-controllers',
        description: 'Wireless, wired, and pro.',
        icon: 'Gamepad2',
        isFeatured: false,
      },
      {
        name: 'VR Headsets',
        slug: 'gaming-vr',
        description: 'Quest, PSVR, and Index.',
        icon: 'Gamepad2',
        isFeatured: false,
      },
    ],
  },
  {
    name: 'Components',
    slug: 'components',
    description: 'CPUs, GPUs, motherboards, storage, and PSUs.',
    icon: 'Cpu',
    isFeatured: true,
    children: [
      {
        name: 'CPUs',
        slug: 'components-cpus',
        description: 'Ryzen, Core, Threadripper.',
        icon: 'Cpu',
        isFeatured: true,
      },
      {
        name: 'GPUs',
        slug: 'components-gpus',
        description: 'RTX, Radeon, and pro cards.',
        icon: 'Cpu',
        isFeatured: true,
      },
      {
        name: 'Storage',
        slug: 'components-storage',
        description: 'NVMe SSDs, HDDs, network storage.',
        icon: 'HardDrive',
        isFeatured: false,
      },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Headphones, chargers, cables, and stands.',
    icon: 'Headphones',
    isFeatured: true,
    children: [
      {
        name: 'Headphones',
        slug: 'accessories-headphones',
        description: 'Over-ear, in-ear, true wireless.',
        icon: 'Headphones',
        isFeatured: true,
      },
      {
        name: 'Chargers & Cables',
        slug: 'accessories-chargers',
        description: 'Fast charging and USB-C.',
        icon: 'Cable',
        isFeatured: false,
      },
      {
        name: 'Stands & Docks',
        slug: 'accessories-stands',
        description: 'Desk setups and docking stations.',
        icon: 'Monitor',
        isFeatured: false,
      },
    ],
  },
];

export const PRODUCT_TEMPLATES = {
  phones: [
    { base: 'iPhone 15 Pro Max', brand: 'apple', min: 14388, max: 19188 },
    { base: 'iPhone 15', brand: 'apple', min: 9588, max: 11988 },
    { base: 'Galaxy S24 Ultra', brand: 'samsung', min: 14388, max: 19188 },
    { base: 'Galaxy S24', brand: 'samsung', min: 9588, max: 11988 },
    { base: 'Galaxy Z Fold 5', brand: 'samsung', min: 21588, max: 25188 },
    { base: 'Galaxy Z Flip 5', brand: 'samsung', min: 11988, max: 14388 },
    { base: 'Pixel 8 Pro', brand: 'samsung', min: 11988, max: 14388 },
  ],
  laptops: [
    { base: 'MacBook Pro 14"', brand: 'apple', min: 23988, max: 39588 },
    { base: 'MacBook Air 13"', brand: 'apple', min: 13188, max: 17988 },
    { base: 'XPS 15', brand: 'dell', min: 19188, max: 31188 },
    { base: 'ThinkPad X1 Carbon', brand: 'lenovo', min: 17988, max: 26388 },
    { base: 'ROG Zephyrus G14', brand: 'asus', min: 17988, max: 27588 },
    { base: 'Legion Pro 7i', brand: 'lenovo', min: 23988, max: 35988 },
    { base: 'Spectre x360', brand: 'hp', min: 14388, max: 21588 },
  ],
  tvs: [
    { base: 'OLED 55" C3', brand: 'lg', min: 16788, max: 21588 },
    { base: 'OLED 65" C3', brand: 'lg', min: 25188, max: 31188 },
    { base: 'Bravia XR 65" A95L', brand: 'sony', min: 35988, max: 41988 },
    { base: 'Neo QLED 65" QN90C', brand: 'samsung', min: 22788, max: 28788 },
    { base: 'Soundbar HT-A7000', brand: 'sony', min: 11988, max: 16788 },
  ],
  gaming: [
    { base: 'PlayStation 5 Slim', brand: 'sony', min: 5388, max: 6588 },
    { base: 'PlayStation 5 Pro', brand: 'sony', min: 8388, max: 9588 },
    { base: 'DualSense Edge Controller', brand: 'sony', min: 2388, max: 2628 },
    { base: 'Quest 3', brand: 'samsung', min: 5988, max: 7788 },
  ],
  components: [
    { base: 'Ryzen 9 7950X3D', brand: 'amd', min: 7188, max: 8388 },
    { base: 'Ryzen 7 7800X3D', brand: 'amd', min: 4788, max: 5988 },
    { base: 'Core i9-14900K', brand: 'intel', min: 6588, max: 7788 },
    { base: 'GeForce RTX 4090', brand: 'nvidia', min: 19188, max: 22788 },
    { base: 'GeForce RTX 4080 Super', brand: 'nvidia', min: 11988, max: 14388 },
    { base: 'Radeon RX 7900 XTX', brand: 'amd', min: 10788, max: 13188 },
  ],
  accessories: [
    { base: 'AirPods Pro 2', brand: 'apple', min: 2388, max: 2988 },
    { base: 'QuietComfort Ultra', brand: 'bose', min: 4548, max: 5148 },
    { base: 'WH-1000XM5', brand: 'sony', min: 4188, max: 4788 },
    { base: 'MagSafe Charger', brand: 'apple', min: 348, max: 588 },
  ],
} as const;

export type ProductCategorySlug = keyof typeof PRODUCT_TEMPLATES;

export const COUPON_FIXTURES = [
  {
    code: 'WELCOME10',
    type: 'percentage' as const,
    value: 10,
    description: '10% off your first order',
  },
  {
    code: 'BLACKFRIDAY25',
    type: 'percentage' as const,
    value: 25,
    description: 'Black Friday — 25% off',
  },
  {
    code: 'STUDENT15',
    type: 'percentage' as const,
    value: 15,
    description: 'Student discount — 15% off',
  },
  // Values are in GHS (×12 from the legacy USD figures).
  {
    code: 'GAMER50',
    type: 'fixed' as const,
    value: 600,
    description: '₵600 off gaming purchases over ₵6,000',
  },
] as const;

export const FAQ_FIXTURES = [
  {
    category: 'orders',
    question: 'How do I track my order?',
    answer:
      'After payment our team will call you to confirm the order and arrange delivery. You can also check live status in your account under Orders.',
  },
  {
    category: 'orders',
    question: 'Can I change or cancel my order?',
    answer:
      "Just tell our agent during the confirmation call \u2014 or message us within 30 minutes of placement. After delivery is dispatched we can't cancel, but you can return.",
  },
  {
    category: 'delivery',
    question: 'How long does delivery take?',
    answer:
      'Greater Accra: same-day or next-day. Other regions: 2\u20134 working days depending on your location. We always confirm the timing on the call after payment.',
  },
  {
    category: 'delivery',
    question: 'Do you deliver outside Ghana?',
    answer:
      'No \u2014 we only deliver within Ghana. For diaspora customers buying for family in Ghana, place the order and put your family member\u2019s phone in the delivery details.',
  },
  {
    category: 'payments',
    question: 'How can I pay?',
    answer:
      'Mobile money (MTN, Vodafone, AirtelTigo) and local cards via Paystack, plus Visa/Mastercard through Stripe and PayPal for international cards.',
  },
  {
    category: 'returns',
    question: 'What is your return policy?',
    answer:
      'You have 7 days from delivery to return any unopened item for a full refund. Opened electronics may incur a restocking fee.',
  },
  {
    category: 'returns',
    question: 'How do refunds work?',
    answer:
      'Refunds are issued to the original payment channel (MoMo, card, PayPal) within 3\u20135 working days of receiving your return at our store.',
  },
  {
    category: 'warranty',
    question: 'Do products come with a warranty?',
    answer:
      'All products carry the manufacturer warranty. We also offer extended TwinSpire Protection plans up to 36 months.',
  },
  {
    category: 'warranty',
    question: 'How do I claim warranty?',
    answer:
      'Start a warranty claim from your Orders page or contact our support team. Most claims are resolved within 7 business days.',
  },
];
