import type { Product } from '@twinspire/types';
import { EmptyState, ProductCardSkeleton } from '@twinspire/ui';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { NextProductCard } from '@/components/shared/product-card';

/** Two columns on phones; three from md; four on desktop — retail mobile standard. */
export const productGridClassName =
  'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4';

export interface ProductGridProps {
  items: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function ProductGrid({
  items,
  emptyTitle = 'No products match those filters',
  emptyDescription = 'Try removing one of the filters or browse another category.',
  className,
}: ProductGridProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <EmptyState
        className={className}
        icon={PackageSearch}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Link
            href="/"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        }
      />
    );
  }

  return (
    <ul className={className ?? productGridClassName}>
      {items.map((product) => (
        <li key={product.id}>
          <NextProductCard product={product} fullProduct={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className={productGridClassName}>
      {Array.from({ length: count }).map((_, idx) => (
        <li key={idx}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
