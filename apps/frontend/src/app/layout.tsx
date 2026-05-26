import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { type ReactNode } from 'react';

import { AppProviders } from '@/components/providers';
import { siteConfig } from '@/lib/site-config';

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
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
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
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
