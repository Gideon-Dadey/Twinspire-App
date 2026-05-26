'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@twinspire/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

const OPTIONS: { value: string; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'popularity', label: 'Most popular' },
  { value: 'rating_desc', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export interface SortSelectProps {
  basePath: string;
}

export function SortSelect({ basePath }: SortSelectProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? 'relevance';

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'relevance') params.delete('sort');
    else params.set('sort', value);
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="h-10 w-[200px]" aria-label="Sort products">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
