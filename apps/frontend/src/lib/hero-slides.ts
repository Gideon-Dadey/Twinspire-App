/**
 * Hero carousel slide data. Each slide is a single promotional banner that
 * mirrors what large electronics retailers (Apple, Best Buy, Vatan, Newegg)
 * showcase above the fold — eyebrow badge, headline, supporting copy, primary
 * CTA, secondary CTA, and a feature image. Edit / reorder freely; the
 * carousel adapts automatically.
 *
 * Images are served from Unsplash with explicit `w/q/fit` params so Next.js
 * `<Image>` can negotiate AVIF/WebP and the same asset can be cached at
 * multiple sizes via `deviceSizes` in `next.config.mjs`.
 */

export interface HeroSlide {
  /** Stable id used for React keys and analytics. */
  id: string;
  /** Small label above the headline (e.g. "Just launched"). */
  eyebrow: string;
  /** Big headline. */
  title: string;
  /** Subtitle / tagline below the headline. */
  subtitle: string;
  /** Optional support copy (price hint, shipping note, etc.). */
  note?: string;
  /** Primary call-to-action. */
  cta: { label: string; href: string };
  /** Optional secondary call-to-action. */
  ctaSecondary?: { label: string; href: string };
  /** Image URL (must be allowed in next.config.mjs `images.remotePatterns`). */
  image: string;
  /** Accessible alt text. */
  alt: string;
  /**
   * Background gradient (Tailwind classes). Keep the gradient subtle so text
   * stays the focal point; avoid pure-dark backgrounds in the light theme.
   */
  background: string;
  /** Text color for the eyebrow accent dot. */
  accent: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'brand',
    eyebrow: 'TwinSpire',
    title: 'The electronics store that keeps up.',
    subtitle:
      'Phones, laptops, gaming, TVs and audio — from the brands you trust, delivered fast and backed by real humans.',
    note: 'Free 2-day shipping on orders over $99.',
    cta: { label: "Shop today's deals", href: '/deals' },
    ctaSecondary: { label: 'Browse new arrivals', href: '/phones' },
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1400&q=80&auto=format&fit=crop',
    alt: 'Modern smartphone on a soft pastel background',
    background:
      'bg-gradient-to-br from-orange-50 via-white to-amber-50',
    accent: 'text-primary',
  },
  {
    id: 'iphone',
    eyebrow: 'Just launched',
    title: 'iPhone 15 Pro · Titanium',
    subtitle: 'So strong. So light. So Pro.',
    note: 'From $999 with eligible trade-in.',
    cta: { label: 'Shop iPhone', href: '/phones' },
    ctaSecondary: { label: 'See the lineup', href: '/phones?brand=apple' },
    image:
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=1400&q=80&auto=format&fit=crop',
    alt: 'iPhone 15 Pro held in natural light',
    background:
      'bg-gradient-to-br from-stone-50 via-white to-orange-100',
    accent: 'text-orange-600',
  },
  {
    id: 'macbook',
    eyebrow: 'Built to last',
    title: 'MacBook Pro M3',
    subtitle: 'Crush deadlines, render scenes, ship code.',
    note: 'Up to 22 hours of battery — from $1,599.',
    cta: { label: 'Shop MacBook', href: '/laptops' },
    ctaSecondary: { label: 'Compare models', href: '/laptops?brand=apple' },
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&q=80&auto=format&fit=crop',
    alt: 'MacBook Pro 14-inch on a clean desk',
    background:
      'bg-gradient-to-br from-stone-50 via-white to-amber-50',
    accent: 'text-amber-600',
  },
  {
    id: 'playstation',
    eyebrow: 'In stock now',
    title: 'PlayStation 5 Slim · Bundle & save',
    subtitle: 'Play has no limits.',
    note: 'Bundle two games and save $80 at checkout.',
    cta: { label: 'Shop PlayStation', href: '/gaming' },
    ctaSecondary: { label: 'See bundles', href: '/deals?category=gaming' },
    image:
      'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=1400&q=80&auto=format&fit=crop',
    alt: 'Gaming controller in a softly lit setup',
    background:
      'bg-gradient-to-br from-zinc-50 via-white to-orange-100',
    accent: 'text-orange-600',
  },
  {
    id: 'oled',
    eyebrow: 'Cinema at home',
    title: 'OLED evo · 4K AI upscaling',
    subtitle: 'Pictures that move you.',
    note: 'Free wall-mount installation in 30 metro areas.',
    cta: { label: 'Shop TVs', href: '/tvs' },
    ctaSecondary: { label: 'Compare panels', href: '/tvs?compare=1' },
    image:
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1400&q=80&auto=format&fit=crop',
    alt: 'Modern OLED television in a stylish living room',
    background:
      'bg-gradient-to-br from-rose-50 via-white to-orange-50',
    accent: 'text-rose-600',
  },
];
