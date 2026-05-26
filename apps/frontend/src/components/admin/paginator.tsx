'use client';

import { Button, cn } from '@twinspire/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginatorProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Paginator({ page, totalPages, total, perPage, onPageChange, className }: PaginatorProps) {
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{start.toLocaleString()}</span>–
        <span className="font-medium text-foreground">{end.toLocaleString()}</span> of{' '}
        <span className="font-medium text-foreground">{total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{' '}
          <span className="font-medium text-foreground">{Math.max(1, totalPages)}</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
