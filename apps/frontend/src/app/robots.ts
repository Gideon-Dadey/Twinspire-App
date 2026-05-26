import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account/',
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/search',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
