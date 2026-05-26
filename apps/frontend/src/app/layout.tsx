import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { type ReactNode } from 'react';

import { AppProviders } from '@/components/providers';
import { siteConfig } from '@/lib/site-config';
// Side-effect import: configures Font Awesome to skip its runtime CSS injection
// and pulls the stylesheet in via the Next CSS pipeline. Keeps icon sizing
// stable on first paint (no FOUC where icons render at 100% screen width).
import '@/lib/fontawesome';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

// Geist is loaded as an alias of Inter until @next/font ships Geist directly
// (Phase 5 adds a proper Geist + Geist Mono loader). This keeps the
// `--font-display` and `--font-mono` CSS variables defined at the html level
// so Tailwind's font-display / font-mono utilities don't fall through to
// system fonts unexpectedly.
const displayFont = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'electronics',
    'smartphones',
    'laptops',
    'gaming',
    'tvs',
    'audio',
    'accessories',
    'twinspire',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@twinspire',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/twinspire-logo.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/twinspire-logo.png', type: 'image/png' }],
    shortcut: [{ url: '/twinspire-logo.png', type: 'image/png' }],
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${displayFont.variable} light`}
      style={{ colorScheme: 'light' }}
    >
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        {/*
         * Global top-loading bar.
         *
         * This is the single highest-impact perceived-performance win on the
         * App Router: every `<Link>` click immediately shows a thin coloured
         * bar at the top of the viewport, so the UI feels instantly
         * responsive even when the new route segment is still streaming.
         *
         * Configuration notes:
         *  - color: brand red (#E91B25) — matches the design system palette.
         *  - height 3px is the industry standard (Vercel docs, GitHub,
         *    Stripe). Anything thicker looks like a loading bar from 2014.
         *  - `showSpinner={false}` — modern top-loaders don't show the
         *    little corkscrew; the bar alone is the indicator.
         *  - `crawlSpeed` controls the trickle while the route is still
         *    fetching; 180ms hits the sweet spot between "alive" and "busy".
         *  - `shadow` produces a subtle glow under the bar so it stays
         *    visible on light backgrounds without looking heavy.
         *  - `zIndex 1900` sits above sticky (1100) and toast (1700) so the
         *    progress bar is always visible even with a toast open.
         */}
        <NextTopLoader
          color="#E91B25"
          initialPosition={0.12}
          crawlSpeed={180}
          height={3}
          crawl
          showSpinner={false}
          easing="ease"
          speed={220}
          shadow="0 0 10px #E91B25, 0 0 5px #E91B25"
          zIndex={1900}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
