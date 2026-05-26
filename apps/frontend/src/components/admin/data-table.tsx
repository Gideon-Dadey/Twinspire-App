'use client';

import { Skeleton, cn } from '@twinspire/ui';
import type { ReactNode } from 'react';

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyState?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  caption?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyState,
  loading,
  loadingRows = 6,
  caption,
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName,
                  )}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: loadingRows }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-b-0">
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[180px]" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12">
                      {emptyState ?? <p className="text-center text-sm text-muted-foreground">No results.</p>}
                    </td>
                  </tr>
                )
                : rows.map((row) => (
                    <tr
                      key={rowKey(row)}
                      className={cn(
                        'border-b border-border/60 transition-colors last:border-b-0',
                        onRowClick ? 'cursor-pointer hover:bg-muted/60' : 'hover:bg-muted/40',
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className={cn(
                            'px-4 py-3 align-middle text-sm',
                            col.align === 'right' && 'text-right',
                            col.align === 'center' && 'text-center',
                            col.className,
                          )}
                        >
                          {col.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
