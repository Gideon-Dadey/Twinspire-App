import { env } from '@/env';

export const siteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  description:
    'TwinSpire is the modern electronics marketplace — premium phones, laptops, TVs, gaming gear, and components from the brands you trust.',
  tagline: 'Premium electronics. Effortless shopping.',
  apiUrl: env.NEXT_PUBLIC_API_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  links: {
    twitter: 'https://twitter.com/twinspire',
    instagram: 'https://instagram.com/twinspire',
    facebook: 'https://facebook.com/twinspire',
  },
  defaultCurrency: env.NEXT_PUBLIC_DEFAULT_CURRENCY,
  defaultLocale: env.NEXT_PUBLIC_DEFAULT_LOCALE,
} as const;

export const primaryCategories = [
  { slug: 'phones', name: 'Phones', tagline: 'Flagship & foldables', icon: 'Smartphone' },
  { slug: 'laptops', name: 'Laptops', tagline: 'Ultrabooks to workstations', icon: 'Laptop' },
  { slug: 'tvs', name: 'TVs & Audio', tagline: 'OLED · QLED · Cinema', icon: 'Tv' },
  { slug: 'gaming', name: 'Gaming', tagline: 'Consoles, GPUs, peripherals', icon: 'Gamepad2' },
  { slug: 'components', name: 'Components', tagline: 'CPUs · GPUs · Storage', icon: 'Cpu' },
  { slug: 'accessories', name: 'Accessories', tagline: 'Cables, chargers, more', icon: 'Headphones' },
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
    { href: '/help/shipping', label: 'Shipping' },
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
