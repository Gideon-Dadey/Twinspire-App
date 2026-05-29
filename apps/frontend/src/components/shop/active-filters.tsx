'use client';

import type { Brand } from '@twinspire/types';
import { Badge, cn } from '@twinspire/ui';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface ActiveFiltersProps {
  basePath: string;
  brands: Brand[];
  className?: string;
}

export function ActiveFilters({
  basePath,
  brands,
  className,
}: ActiveFiltersProps): React.JSX.Element | null {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips = React.useMemo<Chip[]>(() => {
    const list: Chip[] = [];
    const remove = (mutate: (params: URLSearchParams) => void) => () => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete('page');
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    };

    const brandSlugs = searchParams.getAll('brand');
    brandSlugs.forEach((slug) => {
      const brand = brands.find((b) => b.slug === slug);
      if (!brand) return;
      list.push({
        key: `brand-${slug}`,
        label: `Brand: ${brand.name}`,
        onRemove: remove((params) => {
          const remaining = params.getAll('brand').filter((b) => b !== slug);
          params.delete('brand');
          remaining.forEach((b) => params.append('brand', b));
        }),
      });
    });

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      const label = `Price: ${minPrice ? `$${minPrice}` : '$0'} – ${maxPrice ? `$${maxPrice}` : '∞'}`;
      list.push({
        key: 'price',
        label,
        onRemove: remove((params) => {
          params.delete('minPrice');
          params.delete('maxPrice');
        }),
      });
    }

    const rating = searchParams.get('rating');
    if (rating) {
      list.push({
        key: 'rating',
        label: `Rating: ${rating}★ & up`,
        onRemove: remove((params) => params.delete('rating')),
      });
    }

    if (searchParams.get('inStock') === 'true') {
      list.push({
        key: 'in-stock',
        label: 'In stock only',
        onRemove: remove((params) => params.delete('inStock')),
      });
    }

    const q = searchParams.get('q');
    if (q && basePath !== '/search') {
      list.push({
        key: 'q',
        label: `Search: "${q}"`,
        onRemove: remove((params) => params.delete('q')),
      });
    }

    return list;
  }, [searchParams, router, basePath, brands]);

  if (chips.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" size="md" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
            aria-label={`Remove filter: ${chip.label}`}
            onClick={chip.onRemove}
            className="text-muted-foreground hover:bg-background hover:text-foreground ml-0.5 inline-flex size-4 items-center justify-center rounded-full"
          >
            <X className="size-3" aria-hidden />
          </button>
        </Badge>
      ))}
    </div>
  );
}
