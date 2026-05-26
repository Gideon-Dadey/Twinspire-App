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
      { name: 'iPhones', slug: 'phones-iphone', description: 'Apple iPhone family.', icon: 'Smartphone', isFeatured: true },
      { name: 'Android Phones', slug: 'phones-android', description: 'Samsung, Pixel, and more.', icon: 'Smartphone', isFeatured: true },
      { name: 'Foldables', slug: 'phones-foldables', description: 'Z Fold, Z Flip, and friends.', icon: 'Smartphone', isFeatured: false },
    ],
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    description: 'Ultrabooks, gaming laptops, and mobile workstations.',
    icon: 'Laptop',
    isFeatured: true,
    children: [
      { name: 'Ultrabooks', slug: 'laptops-ultrabooks', description: 'Thin & light productivity laptops.', icon: 'Laptop', isFeatured: true },
      { name: 'Gaming Laptops', slug: 'laptops-gaming', description: 'High-refresh, RTX-equipped powerhouses.', icon: 'Laptop', isFeatured: true },
      { name: 'Workstations', slug: 'laptops-workstations', description: 'Pro creator and engineering rigs.', icon: 'Laptop', isFeatured: false },
    ],
  },
  {
    name: 'TVs & Audio',
    slug: 'tvs',
    description: 'OLED, QLED, soundbars, and home theatre.',
    icon: 'Tv',
    isFeatured: true,
    children: [
      { name: 'OLED TVs', slug: 'tvs-oled', description: 'Perfect blacks, infinite contrast.', icon: 'Tv', isFeatured: true },
      { name: 'QLED & LED', slug: 'tvs-qled', description: 'Bright, color-accurate panels.', icon: 'Tv', isFeatured: false },
      { name: 'Soundbars', slug: 'tvs-soundbars', description: 'Dolby Atmos for every room.', icon: 'Speaker', isFeatured: false },
    ],
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Consoles, GPUs, controllers, and accessories.',
    icon: 'Gamepad2',
    isFeatured: true,
    children: [
      { name: 'Consoles', slug: 'gaming-consoles', description: 'PlayStation, Xbox, Nintendo.', icon: 'Gamepad2', isFeatured: true },
      { name: 'Controllers', slug: 'gaming-controllers', description: 'Wireless, wired, and pro.', icon: 'Gamepad2', isFeatured: false },
      { name: 'VR Headsets', slug: 'gaming-vr', description: 'Quest, PSVR, and Index.', icon: 'Gamepad2', isFeatured: false },
    ],
  },
  {
    name: 'Components',
    slug: 'components',
    description: 'CPUs, GPUs, motherboards, storage, and PSUs.',
    icon: 'Cpu',
    isFeatured: true,
    children: [
      { name: 'CPUs', slug: 'components-cpus', description: 'Ryzen, Core, Threadripper.', icon: 'Cpu', isFeatured: true },
      { name: 'GPUs', slug: 'components-gpus', description: 'RTX, Radeon, and pro cards.', icon: 'Cpu', isFeatured: true },
      { name: 'Storage', slug: 'components-storage', description: 'NVMe SSDs, HDDs, network storage.', icon: 'HardDrive', isFeatured: false },
    ],
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Headphones, chargers, cables, and stands.',
    icon: 'Headphones',
    isFeatured: true,
    children: [
      { name: 'Headphones', slug: 'accessories-headphones', description: 'Over-ear, in-ear, true wireless.', icon: 'Headphones', isFeatured: true },
      { name: 'Chargers & Cables', slug: 'accessories-chargers', description: 'Fast charging and USB-C.', icon: 'Cable', isFeatured: false },
      { name: 'Stands & Docks', slug: 'accessories-stands', description: 'Desk setups and docking stations.', icon: 'Monitor', isFeatured: false },
    ],
  },
];

export const PRODUCT_TEMPLATES = {
  phones: [
    { base: 'iPhone 15 Pro Max', brand: 'apple', min: 1199, max: 1599 },
    { base: 'iPhone 15', brand: 'apple', min: 799, max: 999 },
    { base: 'Galaxy S24 Ultra', brand: 'samsung', min: 1199, max: 1599 },
    { base: 'Galaxy S24', brand: 'samsung', min: 799, max: 999 },
    { base: 'Galaxy Z Fold 5', brand: 'samsung', min: 1799, max: 2099 },
    { base: 'Galaxy Z Flip 5', brand: 'samsung', min: 999, max: 1199 },
    { base: 'Pixel 8 Pro', brand: 'samsung', min: 999, max: 1199 },
  ],
  laptops: [
    { base: 'MacBook Pro 14"', brand: 'apple', min: 1999, max: 3299 },
    { base: 'MacBook Air 13"', brand: 'apple', min: 1099, max: 1499 },
    { base: 'XPS 15', brand: 'dell', min: 1599, max: 2599 },
    { base: 'ThinkPad X1 Carbon', brand: 'lenovo', min: 1499, max: 2199 },
    { base: 'ROG Zephyrus G14', brand: 'asus', min: 1499, max: 2299 },
    { base: 'Legion Pro 7i', brand: 'lenovo', min: 1999, max: 2999 },
    { base: 'Spectre x360', brand: 'hp', min: 1199, max: 1799 },
  ],
  tvs: [
    { base: 'OLED 55" C3', brand: 'lg', min: 1399, max: 1799 },
    { base: 'OLED 65" C3', brand: 'lg', min: 2099, max: 2599 },
    { base: 'Bravia XR 65" A95L', brand: 'sony', min: 2999, max: 3499 },
    { base: 'Neo QLED 65" QN90C', brand: 'samsung', min: 1899, max: 2399 },
    { base: 'Soundbar HT-A7000', brand: 'sony', min: 999, max: 1399 },
  ],
  gaming: [
    { base: 'PlayStation 5 Slim', brand: 'sony', min: 449, max: 549 },
    { base: 'PlayStation 5 Pro', brand: 'sony', min: 699, max: 799 },
    { base: 'DualSense Edge Controller', brand: 'sony', min: 199, max: 219 },
    { base: 'Quest 3', brand: 'samsung', min: 499, max: 649 },
  ],
  components: [
    { base: 'Ryzen 9 7950X3D', brand: 'amd', min: 599, max: 699 },
    { base: 'Ryzen 7 7800X3D', brand: 'amd', min: 399, max: 499 },
    { base: 'Core i9-14900K', brand: 'intel', min: 549, max: 649 },
    { base: 'GeForce RTX 4090', brand: 'nvidia', min: 1599, max: 1899 },
    { base: 'GeForce RTX 4080 Super', brand: 'nvidia', min: 999, max: 1199 },
    { base: 'Radeon RX 7900 XTX', brand: 'amd', min: 899, max: 1099 },
  ],
  accessories: [
    { base: 'AirPods Pro 2', brand: 'apple', min: 199, max: 249 },
    { base: 'QuietComfort Ultra', brand: 'bose', min: 379, max: 429 },
    { base: 'WH-1000XM5', brand: 'sony', min: 349, max: 399 },
    { base: 'MagSafe Charger', brand: 'apple', min: 29, max: 49 },
  ],
} as const;

export type ProductCategorySlug = keyof typeof PRODUCT_TEMPLATES;

export const COUPON_FIXTURES = [
  { code: 'WELCOME10', type: 'percentage' as const, value: 10, description: '10% off your first order' },
  { code: 'FREESHIP', type: 'free_shipping' as const, value: 0, description: 'Free shipping on any order' },
  { code: 'BLACKFRIDAY25', type: 'percentage' as const, value: 25, description: 'Black Friday — 25% off' },
  { code: 'STUDENT15', type: 'percentage' as const, value: 15, description: 'Student discount — 15% off' },
  { code: 'GAMER50', type: 'fixed' as const, value: 50, description: '$50 off gaming purchases over $500' },
] as const;

export const FAQ_FIXTURES = [
  {
    category: 'orders',
    question: 'How can I track my order?',
    answer:
      "You'll receive a tracking link by email as soon as your order ships. You can also view real-time tracking in your account under Orders.",
  },
  {
    category: 'orders',
    question: 'Can I change or cancel my order?',
    answer:
      "Orders can be edited or cancelled within 30 minutes of placement. After that we'll have started fulfillment.",
  },
  {
    category: 'shipping',
    question: 'How long does shipping take?',
    answer:
      'Standard shipping is 3-5 business days. Express is 1-2 business days. Same-day pickup is available in 30 metro areas.',
  },
  {
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to 60+ countries. International rates and times are calculated at checkout.',
  },
  {
    category: 'returns',
    question: 'What is your return policy?',
    answer:
      'You have 30 days from delivery to return any unopened item for a full refund. Opened electronics may incur a restocking fee.',
  },
  {
    category: 'returns',
    question: 'How do refunds work?',
    answer:
      'Refunds are issued to the original payment method within 5 business days of receiving your return at our warehouse.',
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
