import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { getBestSellersList } from '@/lib/catalog/catalog-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Best sellers',
  description: 'The TwinSpire best sellers across phones, laptops, audio, gaming, and more.',
  alternates: { canonical: '/best-sellers' },
};

export default async function BestSellersPage() {
  const items = await getBestSellersList(24);
  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Best sellers' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <p className="text-accent text-sm font-medium uppercase tracking-wider">
          Customer favorites
        </p>
        <h1 className="type-page-heading mt-2">Best sellers.</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          What everyone's buying right now — ranked by genuine recent sales, not paid placements.
        </p>
      </header>
      <ProductGrid items={items} />
    </div>
  );
}
