import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb, cn } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { brands } from '@/data/brands';

export const metadata: Metadata = {
  title: 'All brands',
  description: 'Browse every brand stocked on TwinSpire — flagship electronics from across the globe.',
  alternates: { canonical: '/brands' },
};

export default function BrandsPage() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Brands' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Every brand on TwinSpire.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {brands.length} brands, all stocked from authorized distributors — never grey market.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link
              href={`/brands/${brand.slug}`}
              className={cn(
                'group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-all',
                'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg',
              )}
            >
              <p className="font-display text-xl font-semibold tracking-tight group-hover:text-primary">
                {brand.name}
              </p>
              {brand.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{brand.description}</p>
              )}
              <p className="mt-auto pt-3 text-xs text-muted-foreground">
                {brand.productCount ?? 0} products
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
