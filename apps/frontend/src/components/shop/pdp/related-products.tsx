import type { Product } from '@twinspire/types';

import { NextProductCard } from '@/components/shared/product-card';

export interface RelatedProductsProps {
  items: Product[];
}

export function RelatedProducts({ items }: RelatedProductsProps) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        You might also like
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((product) => (
          <li key={product.id}>
            <NextProductCard product={product} fullProduct={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
