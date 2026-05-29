import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { getNewArrivalsList } from '@/lib/catalog/catalog-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'New arrivals',
  description:
    'The newest electronics on TwinSpire — flagships, foldables, and freshly shelved gear.',
  alternates: { canonical: '/new-arrivals' },
};

export default async function NewArrivalsPage() {
  const items = await getNewArrivalsList(24);
  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'New arrivals' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <p className="text-primary text-sm font-medium uppercase tracking-wider">Just landed</p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          New arrivals.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          Fresh products from the brands you trust. New drops added every Tuesday.
        </p>
      </header>
      <ProductGrid items={items} />
    </div>
  );
}
