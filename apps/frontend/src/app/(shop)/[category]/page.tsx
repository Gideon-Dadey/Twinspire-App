import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ActiveFilters } from '@/components/shop/active-filters';
import {
  ActiveFiltersFallback,
  FiltersMobileTriggerFallback,
  FiltersPanelFallback,
  SortSelectFallback,
} from '@/components/shop/catalog-suspense-fallbacks';
import { FiltersMobileTrigger } from '@/components/shop/filters/filters-mobile-trigger';
import { FiltersPanel } from '@/components/shop/filters/filters-panel';
import { Pagination } from '@/components/shop/pagination';
import { ProductGrid } from '@/components/shop/product-grid';
import { SortSelect } from '@/components/shop/sort-select';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import {
  getCategoryBySlug,
  getChildCategories,
  getStorefrontBrands,
  getStorefrontCategories,
} from '@/lib/catalog/catalog-service';
import { queryCatalog, type SortKey } from '@/lib/helpers/catalog-query';
import {
  readArrayParam,
  readBooleanParam,
  readNumberParam,
  readStringParam,
} from '@/lib/helpers/url';
import { Breadcrumb } from '@twinspire/ui';

const STATIC_PAGES = new Set([
  'cart',
  'checkout',
  'search',
  'blog',
  'deals',
  'brands',
  'account',
  'wishlist',
  'help',
  'legal',
  'about',
  'careers',
  'press',
  'sustainability',
  'stores',
  'new-arrivals',
  'best-sellers',
  'categories',
  'products',
]);

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const categories = await getStorefrontCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found' };
  return {
    title: `${category.name} — Shop the latest`,
    description:
      category.description ??
      `Browse ${category.name} at TwinSpire — premium electronics from the brands you trust.`,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  if (STATIC_PAGES.has(slug)) notFound();
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const sort = readStringParam(sp.sort) as SortKey | undefined;
  const page = readNumberParam(sp.page) ?? 1;
  const minPrice = readNumberParam(sp.minPrice);
  const maxPrice = readNumberParam(sp.maxPrice);
  const minRating = readNumberParam(sp.rating);
  const inStock = readBooleanParam(sp.inStock);
  const brandSlugs = readArrayParam(sp.brand);

  const result = await queryCatalog({
    categorySlug: category.slug,
    brandSlugs,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort,
    page,
  });

  const basePath = `/${category.slug}`;
  const children = await getChildCategories(category.slug);
  const brands = await getStorefrontBrands();

  // Count of currently-applied filters — shown as a badge on the mobile
  // "Filter" trigger so users can see at a glance whether they've already
  // narrowed the catalog. Brand selections count individually, the others
  // contribute 1 each when present.
  const appliedFilterCount =
    brandSlugs.length +
    (minPrice != null ? 1 : 0) +
    (maxPrice != null ? 1 : 0) +
    (minRating != null ? 1 : 0) +
    (inStock === true ? 1 : 0);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: category.name }]}
          linkComponent={NextLinkBreadcrumb}
          className="mb-6"
        />

        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted-foreground mt-2 max-w-prose">{category.description}</p>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Showing {result.items.length} of {result.meta.total}{' '}
            {result.meta.total === 1 ? 'product' : 'products'}
          </p>
        </header>

        {children.length > 0 && (
          <ul className="mb-8 flex flex-wrap gap-2">
            {children.map((child) => (
              <li key={child.id}>
                <a
                  href={`/${child.slug}`}
                  className="border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          {/* Sidebar: visible at lg+, hidden on mobile/tablet — mobile users
              reach filters through the FiltersMobileTrigger button below. */}
          <Suspense fallback={<FiltersPanelFallback className="hidden lg:block" />}>
            <FiltersPanel
              facets={result.facets}
              basePath={basePath}
              className="hidden lg:block"
              idPrefix="desktop"
            />
          </Suspense>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Suspense fallback={<FiltersMobileTriggerFallback />}>
                <FiltersMobileTrigger
                  facets={result.facets}
                  basePath={basePath}
                  appliedCount={appliedFilterCount}
                />
              </Suspense>
              <div className="ml-auto">
                <Suspense fallback={<SortSelectFallback />}>
                  <SortSelect basePath={basePath} />
                </Suspense>
              </div>
              <div className="basis-full">
                <Suspense fallback={<ActiveFiltersFallback />}>
                  <ActiveFilters basePath={basePath} brands={brands} />
                </Suspense>
              </div>
            </div>

            <ProductGrid items={result.items} />

            <Pagination meta={result.meta} basePath={basePath} searchParams={sp} />
          </div>
        </div>
      </div>
    </div>
  );
}
