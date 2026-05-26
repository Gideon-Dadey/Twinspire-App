import { env } from '@/env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  description:
    "TwinSpire is Ghana's modern electronics store — premium phones, laptops, TVs, gaming gear, and components, available in our stores across Accra. Pay online with mobile money, card, or PayPal; we arrange delivery by phone.",
  tagline: 'Premium electronics in Ghana. Effortless shopping.',
  apiUrl: env.NEXT_PUBLIC_API_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  links: {
    twitter: 'https://twitter.com/twinspire',
    instagram: 'https://instagram.com/twinspire',
    facebook: 'https://facebook.com/twinspire',
  },
  defaultCurrency: env.NEXT_PUBLIC_DEFAULT_CURRENCY,
  defaultLocale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
  // Ghana-only operation: country code drives address forms, phone prefixes,
  // and the country selector default.
  country: 'GH' as const,
  countryName: 'Ghana',
  phoneCountryCode: '+233',
} as const;

export const primaryCategories = [
  {
    slug: 'phones',
    name: 'Phones',
    tagline: 'Flagship & foldables',
    icon: 'Smartphone',
    image:
      'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=800&q=75',
    imageAlt: 'Modern smartphone on a soft background',
  },
  {
    slug: 'laptops',
    name: 'Laptops',
    tagline: 'Ultrabooks to workstations',
    icon: 'Laptop',
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=75',
    imageAlt: 'Premium silver laptop open on a desk',
  },
  {
    slug: 'tvs',
    name: 'TVs & Audio',
    tagline: 'OLED · QLED · Cinema',
    icon: 'Tv',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=75',
    imageAlt: 'Large OLED TV in a modern living room',
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    tagline: 'Consoles, GPUs, peripherals',
    icon: 'Gamepad2',
    image:
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=75',
    imageAlt: 'Wireless gaming controller in dramatic light',
  },
  {
    slug: 'components',
    name: 'Components',
    tagline: 'CPUs · GPUs · Storage',
    icon: 'Cpu',
    image:
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=75',
    imageAlt: 'Close-up of computer components and CPU',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    tagline: 'Cables, chargers, more',
    icon: 'Headphones',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=75',
    imageAlt: 'Premium over-ear headphones',
  },
] as const;

export const primaryNav = [
  { href: '/phones', label: 'Phones' },
  { href: '/laptops', label: 'Laptops' },
  { href: '/tvs', label: 'TVs & Audio' },
  { href: '/gaming', label: 'Gaming' },
  { href: '/components', label: 'Components' },
  { href: '/accessories', label: 'Accessories' },
  { href: '/deals', label: 'Deals', highlight: true },
] as const;

export const footerNav = {
  shop: [
    { href: '/phones', label: 'Phones' },
    { href: '/laptops', label: 'Laptops' },
    { href: '/tvs', label: 'TVs & Audio' },
    { href: '/gaming', label: 'Gaming' },
    { href: '/components', label: 'Components' },
    { href: '/accessories', label: 'Accessories' },
    { href: '/brands', label: 'All Brands' },
  ],
  service: [
    { href: '/help/faq', label: 'FAQ' },
    { href: '/help/delivery', label: 'Delivery' },
    { href: '/help/returns', label: 'Returns' },
    { href: '/help/warranty', label: 'Warranty' },
    { href: '/help/contact', label: 'Contact Us' },
    { href: '/stores', label: 'Store Locator' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/sustainability', label: 'Sustainability' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/legal/privacy', label: 'Privacy' },
    { href: '/legal/terms', label: 'Terms' },
    { href: '/legal/cookies', label: 'Cookies' },
    { href: '/legal/accessibility', label: 'Accessibility' },
  ],
} as const;
