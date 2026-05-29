import type { Metadata } from 'next';

import { Badge, Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { getDealsList } from '@/lib/catalog/catalog-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Deals & promotions',
  description:
    "Today's best electronics deals across every category — only the real discounts make this list.",
  alternates: { canonical: '/deals' },
};

export default async function DealsPage() {
  const deals = await getDealsList(24);
  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Deals' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10 flex flex-col gap-3">
        <Badge variant="destructive" size="md" className="w-fit uppercase">
          Sale
        </Badge>
        <h1 className="type-page-heading">Today's best deals.</h1>
        <p className="text-muted-foreground max-w-2xl">
          {deals.length} curated discounts across phones, laptops, gaming, TVs, components, and
          accessories. Refreshed daily — and only listed when the savings are real.
        </p>
      </header>

      <ProductGrid items={deals} />
    </div>
  );
}
