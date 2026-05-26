import type { Metadata } from 'next';

import { ActiveFilters } from '@/components/shop/active-filters';
import { FiltersPanel } from '@/components/shop/filters/filters-panel';
import { Pagination } from '@/components/shop/pagination';
import { ProductGrid } from '@/components/shop/product-grid';
import { SortSelect } from '@/components/shop/sort-select';
import { queryCatalog, type SortKey } from '@/lib/helpers/catalog-query';
import { readArrayParam, readBooleanParam, readNumberParam, readStringParam } from '@/lib/helpers/url';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = readStringParam(sp.q);
  return {
    title: q ? `Search: "${q}"` : 'Search',
    description: q
      ? `Search results for "${q}" on TwinSpire — electronics, gadgets, and accessories.`
      : 'Search TwinSpire for the latest electronics, brands, and accessories.',
    robots: q ? { index: false, follow: true } : undefined,
    alternates: { canonical: '/search' },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = readStringParam(sp.q);
  const sort = readStringParam(sp.sort) as SortKey | undefined;
  const page = readNumberParam(sp.page) ?? 1;
  const result = queryCatalog({
    q,
    brandSlugs: readArrayParam(sp.brand),
    minPrice: readNumberParam(sp.minPrice),
    maxPrice: readNumberParam(sp.maxPrice),
    minRating: readNumberParam(sp.rating),
    inStock: readBooleanParam(sp.inStock),
    sort,
    page,
  });

  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Search</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Browse the catalog'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.meta.total} {result.meta.total === 1 ? 'product' : 'products'} found
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <FiltersPanel facets={result.facets} basePath="/search" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <ActiveFilters basePath="/search" />
            <SortSelect basePath="/search" />
          </div>

          <ProductGrid
            items={result.items}
            emptyTitle={q ? `No results for "${q}"` : 'No products match those filters'}
            emptyDescription="Try removing filters, checking your spelling, or browsing our categories."
          />

          <Pagination meta={result.meta} basePath="/search" searchParams={sp} />
        </div>
      </div>
    </div>
  );
}
