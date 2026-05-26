import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ActiveFilters } from '@/components/shop/active-filters';
import { FiltersPanel } from '@/components/shop/filters/filters-panel';
import { Pagination } from '@/components/shop/pagination';
import { ProductGrid } from '@/components/shop/product-grid';
import { SortSelect } from '@/components/shop/sort-select';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { categories, getCategoryBySlug, getChildCategories } from '@/data/categories';
import { queryCatalog, type SortKey } from '@/lib/helpers/catalog-query';
import { readArrayParam, readBooleanParam, readNumberParam, readStringParam } from '@/lib/helpers/url';
import { Breadcrumb } from '@twinspire/ui';

const STATIC_PAGES = new Set(['cart', 'checkout', 'search', 'blog', 'deals', 'brands', 'account', 'wishlist', 'help', 'legal', 'about', 'careers', 'press', 'sustainability', 'stores', 'new-arrivals', 'best-sellers', 'categories', 'products']);

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return categories
    .filter((c) => !c.parentId)
    .map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found' };
  return {
    title: `${category.name} — Shop the latest`,
    description: category.description ?? `Browse ${category.name} at TwinSpire — premium electronics from the brands you trust.`,
    alternates: { canonical: `/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  if (STATIC_PAGES.has(slug)) notFound();
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const sort = readStringParam(sp.sort) as SortKey | undefined;
  const page = readNumberParam(sp.page) ?? 1;
  const minPrice = readNumberParam(sp.minPrice);
  const maxPrice = readNumberParam(sp.maxPrice);
  const minRating = readNumberParam(sp.rating);
  const inStock = readBooleanParam(sp.inStock);
  const brandSlugs = readArrayParam(sp.brand);

  const result = queryCatalog({
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
  const children = getChildCategories(category.slug);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: category.name },
          ]}
          linkComponent={NextLinkBreadcrumb}
          className="mb-6"
        />

        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 max-w-prose text-muted-foreground">{category.description}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
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
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {child.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <FiltersPanel facets={result.facets} basePath={basePath} />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <ActiveFilters basePath={basePath} />
              <SortSelect basePath={basePath} />
            </div>

            <ProductGrid items={result.items} />

            <Pagination meta={result.meta} basePath={basePath} searchParams={sp} />
          </div>
        </div>
      </div>
    </div>
  );
}
