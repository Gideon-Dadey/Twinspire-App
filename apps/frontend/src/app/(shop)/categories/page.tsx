import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb, cn } from '@twinspire/ui';
import {
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  Smartphone,
  Tv,
  type LucideIcon,
} from 'lucide-react';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { getTopLevelCategories } from '@/data/categories';

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

export default function CategoriesPage() {
  const categories = getTopLevelCategories();
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Every category on TwinSpire.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
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
                  'group flex h-full items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all',
                  'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg',
                )}
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold tracking-tight group-hover:text-primary">
                    {category.name}
                  </p>
                  {category.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {category.productCount ?? 0} products
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
