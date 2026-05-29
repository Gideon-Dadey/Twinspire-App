import type { MetadataRoute } from 'next';

import { posts } from '@/data/posts';
import {
  getStorefrontBrands,
  getStorefrontCategories,
  getStorefrontProducts,
} from '@/lib/catalog/catalog-service';
import { siteConfig } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, '');
  const now = new Date();
  const [categories, brands, products] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontBrands(),
    getStorefrontProducts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/deals`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/best-sellers`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/new-arrivals`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/brands`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/careers`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${base}/sustainability`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/stores`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/help/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/help/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/help/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/help/warranty`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/help/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    {
      url: `${base}/legal/accessibility`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${base}/brands/${b.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt ?? p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes, ...postRoutes];
}
