/**
 * Rotating promo images for the homepage deals banner (right-hand “ad rail”).
 * Each slide links to a relevant category or deals page.
 */

export interface DealsAdSlide {
  id: string;
  image: string;
  alt: string;
  /** Short promo line shown on the image. */
  headline: string;
  /** Optional price or offer hint. */
  tagline?: string;
  href: string;
}

export const DEALS_AD_SLIDES: DealsAdSlide[] = [
  {
    id: 'oled-tv',
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1800&q=70',
    alt: 'Smart OLED television with streaming apps on screen',
    headline: 'OLED TVs · Up to 40% off',
    tagline: 'Samsung, LG & Sony in stock',
    href: '/tvs',
  },
  {
    id: 'macbook',
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1800&q=70',
    alt: 'MacBook Pro on a clean desk setup',
    headline: 'Premium laptops',
    tagline: 'Apple, HP, Dell & Lenovo',
    href: '/laptops',
  },
  {
    id: 'iphone',
    image:
      'https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=1800&q=70',
    alt: 'Latest smartphone held in hand',
    headline: 'Flagship phones',
    tagline: 'iPhone, Galaxy & more',
    href: '/phones',
  },
  {
    id: 'gaming',
    image:
      'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?auto=format&fit=crop&w=1800&q=70',
    alt: 'Gaming controller in a neon-lit setup',
    headline: 'Gaming gear',
    tagline: 'Consoles, monitors & peripherals',
    href: '/gaming',
  },
  {
    id: 'audio',
    image:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1800&q=70',
    alt: 'Wireless headphones and speaker on a shelf',
    headline: 'Home audio',
    tagline: 'Sonos, Bose & soundbars',
    href: '/headphones',
  },
  {
    id: 'wearables',
    image:
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1800&q=70',
    alt: 'Smartwatch displaying fitness metrics',
    headline: 'Wearables',
    tagline: 'Smartwatches & fitness trackers',
    href: '/wearables',
  },
];
