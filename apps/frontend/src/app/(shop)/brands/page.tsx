import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb, cn } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { getStorefrontBrands, getStorefrontProducts } from '@/lib/catalog/catalog-service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All brands',
  description:
    'Browse every brand stocked on TwinSpire — flagship electronics from across the globe.',
  alternates: { canonical: '/brands' },
};

export default async function BrandsPage() {
  const [brands, products] = await Promise.all([getStorefrontBrands(), getStorefrontProducts()]);
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.brandId, (counts.get(product.brandId) ?? 0) + 1);
  }

  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Brands' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Every brand on TwinSpire.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          {brands.length} brands, all stocked from authorized distributors — never grey market.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brands/${brand.slug}`}
              className={cn(
                'border-border bg-card group flex h-full flex-col rounded-lg border p-5 transition-all',
                'hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg',
              )}
            >
              <p className="font-display group-hover:text-primary text-xl font-semibold tracking-tight">
                {brand.name}
              </p>
              {brand.description && (
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                  {brand.description}
                </p>
              )}
              <p className="text-muted-foreground mt-auto pt-3 text-xs">
                {counts.get(brand.id) ?? brand.productCount ?? 0} products
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
