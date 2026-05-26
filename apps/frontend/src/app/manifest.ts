import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E91B25',
    icons: [
      { src: '/twinspire-logo.png', sizes: 'any', type: 'image/png', purpose: 'any' },
      { src: '/twinspire-logo.png', sizes: 'any', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
