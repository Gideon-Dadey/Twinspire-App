'use client';

import type { CatalogFacets } from '@/lib/helpers/catalog-query';
import { Button, Checkbox, Input, Label } from '@twinspire/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { FilterSection } from './filter-section';

import { buildSearchParams, readArrayParam } from '@/lib/helpers/url';

export interface FiltersPanelProps {
  facets: CatalogFacets;
  className?: string;
  /** Override the path the filters mutate (defaults to current pathname). */
  basePath: string;
}

const RATING_OPTIONS = [
  { value: 4.5, label: '4.5★ & up' },
  { value: 4, label: '4★ & up' },
  { value: 3.5, label: '3.5★ & up' },
  { value: 3, label: '3★ & up' },
];

export function FiltersPanel({ facets, basePath, className }: FiltersPanelProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedBrands = React.useMemo(() => readArrayParam(searchParams.getAll('brand')), [searchParams]);
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const minRating = searchParams.get('rating');
  const inStockOnly = searchParams.get('inStock') === 'true';

  const [priceMin, setPriceMin] = React.useState(minPrice);
  const [priceMax, setPriceMax] = React.useState(maxPrice);

  React.useEffect(() => {
    setPriceMin(minPrice);
    setPriceMax(maxPrice);
  }, [minPrice, maxPrice]);

  function commit(next: Record<string, string | string[] | undefined | null>) {
    const merged: Record<string, string | string[] | undefined | null> = {};
    searchParams.forEach((value, key) => {
      if (key === 'brand') {
        const all = searchParams.getAll('brand');
        merged.brand = all;
      } else {
        merged[key] = value;
      }
    });
    Object.assign(merged, next);
    merged.page = undefined;
    const sp = buildSearchParams(merged);
    const qs = sp.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  function toggleBrand(brandSlug: string, checked: boolean) {
    const next = new Set(selectedBrands);
    if (checked) next.add(brandSlug);
    else next.delete(brandSlug);
    commit({ brand: [...next] });
  }

  function clearAll() {
    router.push(basePath, { scroll: false });
  }

  return (
    <aside className={className}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-display text-base font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Reset
        </Button>
      </div>

      <FilterSection title="Brand">
        <ul className="space-y-2">
          {facets.brands.map((brand) => {
            const id = `brand-${brand.value}`;
            const checked = selectedBrands.includes(brand.value);
            return (
              <li key={brand.value} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(state) => toggleBrand(brand.value, state === true)}
                />
                <Label htmlFor={id} className="flex-1 text-sm font-normal">
                  {brand.label}
                  <span className="ml-2 text-xs text-muted-foreground">({brand.count})</span>
                </Label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Price">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            commit({
              minPrice: priceMin || undefined,
              maxPrice: priceMax || undefined,
            });
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin}
              onChange={(event) => setPriceMin(event.target.value)}
              className="h-9"
              aria-label="Minimum price"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value)}
              className="h-9"
              aria-label="Maximum price"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Apply
          </Button>
          <p className="text-xs text-muted-foreground">
            Range in catalog: ${facets.priceRange.min} – ${facets.priceRange.max}
          </p>
        </form>
      </FilterSection>

      <FilterSection title="Rating">
        <ul className="space-y-2">
          {RATING_OPTIONS.map((opt) => {
            const id = `rating-${opt.value}`;
            const checked = minRating === String(opt.value);
            return (
              <li key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(state) =>
                    commit({ rating: state === true ? String(opt.value) : undefined })
                  }
                />
                <Label htmlFor={id} className="text-sm font-normal">
                  {opt.label}
                </Label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(state) => commit({ inStock: state === true ? 'true' : undefined })}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal">
            In stock only
          </Label>
        </div>
      </FilterSection>
    </aside>
  );
}
