'use client';

import { cn } from '@twinspire/ui';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className,
  placeholder = 'Search products, brands, categories…',
}: SearchBarProps): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push('/search');
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      action="/search"
      onSubmit={handleSubmit}
      className={cn('w-full', className)}
    >
      <label htmlFor="site-search" className="sr-only">
        Search products
      </label>
      <div className="relative w-full">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id="site-search"
          name="q"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          )}
        />
      </div>
    </form>
  );
}
