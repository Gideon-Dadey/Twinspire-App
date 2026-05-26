import type { PaginatedMeta } from '@twinspire/types';
import { Button, cn } from '@twinspire/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface PaginationProps {
  meta: PaginatedMeta;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  className?: string;
}

function buildHref(basePath: string, params: Record<string, string | string[] | undefined>, nextPage: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.set(key, value);
  }
  if (nextPage > 1) search.set('page', String(nextPage));
  else search.delete('page');
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageList(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | 'gap')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) result.push('gap');
  for (let i = start; i <= end; i++) result.push(i);
  if (end < total - 1) result.push('gap');
  result.push(total);
  return result;
}

export function Pagination({ meta, basePath, searchParams, className }: PaginationProps) {
  const { page, totalPages, hasPrev, hasNext } = meta;
  if (totalPages <= 1) return null;

  const pages = pageList(page, totalPages);

  return (
    <nav className={cn('flex items-center justify-between gap-2 pt-8', className)} aria-label="Pagination">
      <Button asChild variant="outline" size="sm" disabled={!hasPrev}>
        <Link
          href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
          aria-disabled={!hasPrev}
          tabIndex={hasPrev ? undefined : -1}
        >
          <ChevronLeft className="size-4" aria-hidden /> Previous
        </Link>
      </Button>

      <ul className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === 'gap' ? (
            <li key={`gap-${idx}`} className="px-2 text-sm text-muted-foreground" aria-hidden>
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={buildHref(basePath, searchParams, p)}
                aria-current={p === page ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors',
                  p === page
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>

      <Button asChild variant="outline" size="sm" disabled={!hasNext}>
        <Link
          href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
          aria-disabled={!hasNext}
          tabIndex={hasNext ? undefined : -1}
        >
          Next <ChevronRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
