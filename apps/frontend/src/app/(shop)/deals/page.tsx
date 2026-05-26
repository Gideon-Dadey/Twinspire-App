import type { Metadata } from 'next';

import { Badge, Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { getDeals } from '@/data/products';

export const metadata: Metadata = {
  title: 'Deals & promotions',
  description: 'Today\'s best electronics deals across every category — only the real discounts make this list.',
  alternates: { canonical: '/deals' },
};

export default function DealsPage() {
  const deals = getDeals(24);
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Deals' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10 flex flex-col gap-3">
        <Badge variant="destructive" size="md" className="w-fit uppercase">
          Sale
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Today's best deals.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {deals.length} curated discounts across phones, laptops, gaming, TVs, components, and
          accessories. Refreshed daily — and only listed when the savings are real.
        </p>
      </header>

      <ProductGrid items={deals} />
    </div>
  );
}
