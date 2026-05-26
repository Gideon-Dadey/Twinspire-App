import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { getNewArrivals } from '@/data/products';

export const metadata: Metadata = {
  title: 'New arrivals',
  description: 'The newest electronics on TwinSpire — flagships, foldables, and freshly shelved gear.',
  alternates: { canonical: '/new-arrivals' },
};

export default function NewArrivalsPage() {
  const items = getNewArrivals(24);
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'New arrivals' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Just landed</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
          New arrivals.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Fresh products from the brands you trust. New drops added every Tuesday.
        </p>
      </header>
      <ProductGrid items={items} />
    </div>
  );
}
