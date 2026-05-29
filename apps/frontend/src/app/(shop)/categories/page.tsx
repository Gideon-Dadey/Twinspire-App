import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb, cn } from '@twinspire/ui';
import { Cpu, Gamepad2, Headphones, Laptop, Smartphone, Tv, type LucideIcon } from 'lucide-react';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { getTopLevelCategories, getStorefrontProducts } from '@/lib/catalog/catalog-service';

export const dynamic = 'force-dynamic';

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Cpu,
  Headphones,
};

export const metadata: Metadata = {
  title: 'All categories',
  description: 'Browse every TwinSpire category.',
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getTopLevelCategories(),
    getStorefrontProducts(),
  ]);
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const categoryId of product.categoryIds) {
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    }
  }
  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Every category on TwinSpire.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">
          From phones to RAM, browse the full catalog by category.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = ICONS[category.icon ?? 'Smartphone'] ?? Smartphone;
          return (
            <li key={category.id}>
              <Link
                href={`/${category.slug}`}
                className={cn(
                  'border-border bg-card group flex h-full items-start gap-4 rounded-lg border p-5 transition-all',
                  'hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg',
                )}
              >
                <span className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-display group-hover:text-primary text-lg font-semibold tracking-tight">
                    {category.name}
                  </p>
                  {category.description && (
                    <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
                  )}
                  <p className="text-muted-foreground mt-2 text-xs">
                    {counts.get(category.id) ?? category.productCount ?? 0} products
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
