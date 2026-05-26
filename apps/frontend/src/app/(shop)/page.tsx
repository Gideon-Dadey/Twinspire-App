import type { Metadata } from 'next';

import { BestSellers } from '@/components/marketing/best-sellers';
import { BrandStrip } from '@/components/marketing/brand-strip';
import { CategoryGrid } from '@/components/marketing/category-grid';
import { DealsBanner } from '@/components/marketing/deals-banner';
import { EditorialStrip } from '@/components/marketing/editorial';
import { FeaturedProducts } from '@/components/marketing/featured-products';
import { Hero } from '@/components/marketing/hero';
import { ValueProps } from '@/components/marketing/value-props';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStrip />
      <CategoryGrid />
      <FeaturedProducts />
      <DealsBanner />
      <BestSellers />
      <ValueProps />
      <EditorialStrip />
    </>
  );
}
