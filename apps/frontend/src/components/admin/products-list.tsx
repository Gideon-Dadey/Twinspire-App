'use client';

import {
  Badge,
  Button,
  Input,
  Money,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from '@twinspire/ui';
import type { Product } from '@twinspire/types';
import { Pencil, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  useAdminBrands,
  useAdminCategories,
  useAdminProducts,
} from '@/lib/hooks/use-admin';

import { DataTable } from './data-table';
import { Paginator } from './paginator';

const STATUS_LABELS: Record<Product['status'] | 'all', string> = {
  all: 'All statuses',
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
  out_of_stock: 'Out of stock',
};

const STOCK_LABEL: Record<Product['stockStatus'], string> = {
  in_stock: 'In stock',
  low_stock: 'Low stock',
  out_of_stock: 'Out of stock',
  backorder: 'Backorder',
  preorder: 'Pre-order',
};

const STOCK_TONE: Record<Product['stockStatus'], string> = {
  in_stock: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  low_stock: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  out_of_stock: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  backorder: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  preorder: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
};

const PER_PAGE = 12;

export function ProductsList() {
  const searchParams = useSearchParams();
  const initialLowStock = searchParams.get('lowStock') === '1';

  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Product['status'] | 'all'>('all');
  const [brandId, setBrandId] = useState<string>('all');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [lowStock, setLowStock] = useState(initialLowStock);

  const products = useAdminProducts({
    page,
    perPage: PER_PAGE,
    q: q || undefined,
    status,
    brandId: brandId === 'all' ? undefined : brandId,
    categoryId: categoryId === 'all' ? undefined : categoryId,
    lowStock: lowStock || undefined,
  });

  const brands = useAdminBrands();
  const categories = useAdminCategories();

  const totals = products.data?.totals;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryTile label="Published" value={totals?.active ?? 0} />
        <SummaryTile label="Draft" value={totals?.draft ?? 0} />
        <SummaryTile label="Archived" value={totals?.archived ?? 0} />
        <SummaryTile label="Low stock" value={totals?.lowStock ?? 0} tone="warning" />
        <SummaryTile label="Out of stock" value={totals?.outOfStock ?? 0} tone="danger" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search products"
            value={q}
            placeholder="Search by name, SKU or slug"
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setPage(1);
            setStatus(v as Product['status'] | 'all');
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={brandId}
          onValueChange={(v) => {
            setPage(1);
            setBrandId(v);
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by brand">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {(brands.data?.items ?? []).map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryId}
          onValueChange={(v) => {
            setPage(1);
            setCategoryId(v);
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(categories.data?.items ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={lowStock ? 'default' : 'outline'}
          aria-pressed={lowStock}
          onClick={() => {
            setPage(1);
            setLowStock((prev) => !prev);
          }}
          className="whitespace-nowrap"
        >
          Low stock only
        </Button>
      </div>

      <DataTable
        loading={products.isLoading}
        rowKey={(row) => row.id}
        rows={products.data?.items ?? []}
        columns={[
          {
            id: 'product',
            header: 'Product',
            cell: (p) => (
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-12 overflow-hidden rounded-md border border-border/60 bg-muted">
                  {p.images[0]?.url ? (
                    <Image
                      src={p.images[0].url}
                      alt={p.images[0].alt ?? p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="block max-w-[28ch] truncate font-medium text-foreground hover:underline"
                  >
                    {p.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'brand',
            header: 'Brand',
            cell: (p) => <span className="text-muted-foreground">{p.brandName ?? '—'}</span>,
          },
          {
            id: 'price',
            header: 'Price',
            align: 'right',
            cell: (p) => (
              <div className="text-right">
                <Money value={{ amount: p.price.amount, currency: p.price.currency }} className="font-medium text-foreground" />
                {p.price.compareAtAmount ? (
                  <p className="text-xs text-muted-foreground">
                    <Money
                      value={{ amount: p.price.compareAtAmount, currency: p.price.currency }}
                      strikethrough
                    />
                  </p>
                ) : null}
              </div>
            ),
          },
          {
            id: 'stock',
            header: 'Stock',
            cell: (p) => (
              <Badge variant="outline" className={cn('h-5 rounded-full border px-2 text-[10px] uppercase tracking-wide', STOCK_TONE[p.stockStatus])}>
                {STOCK_LABEL[p.stockStatus]}
              </Badge>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (p) => (
              <Badge
                variant="outline"
                className={cn(
                  'h-5 rounded-full border px-2 text-[10px] uppercase tracking-wide',
                  p.status === 'published' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
                  p.status === 'draft' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
                  p.status === 'archived' && 'bg-muted text-muted-foreground',
                  p.status === 'out_of_stock' && 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
                )}
              >
                {STATUS_LABELS[p.status]}
              </Badge>
            ),
          },
          {
            id: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (p) => (
              <Button asChild variant="ghost" size="sm" aria-label={`Edit ${p.name}`}>
                <Link href={`/admin/products/${p.id}`}>
                  <Pencil className="size-4" aria-hidden />
                </Link>
              </Button>
            ),
          },
        ]}
        emptyState={
          <div className="grid place-items-center gap-3 py-6 text-center text-sm">
            <p className="text-muted-foreground">No products match your filters.</p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="size-4" aria-hidden /> New product
              </Link>
            </Button>
          </div>
        }
      />

      {products.data ? (
        <Paginator
          page={products.data.page}
          totalPages={products.data.totalPages}
          total={products.data.total}
          perPage={products.data.perPage}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'danger' }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3',
        tone === 'warning' && 'border-amber-500/20 bg-amber-500/5',
        tone === 'danger' && 'border-rose-500/20 bg-rose-500/5',
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}
