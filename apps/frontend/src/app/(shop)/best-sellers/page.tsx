import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { getBestSellers } from '@/data/products';

export const metadata: Metadata = {
  title: 'Best sellers',
  description: 'The TwinSpire best sellers across phones, laptops, audio, gaming, and more.',
  alternates: { canonical: '/best-sellers' },
};

export default function BestSellersPage() {
  const items = getBestSellers(24);
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Best sellers' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">Customer favorites</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Best sellers.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          What everyone's buying right now — ranked by genuine recent sales, not paid placements.
        </p>
      </header>
      <ProductGrid items={items} />
    </div>
  );
}
