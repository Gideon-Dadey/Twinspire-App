import type { Product } from '@twinspire/types';

import { NextProductCard } from '@/components/shared/product-card';
import { productGridClassName } from '@/components/shop/product-grid';

export interface RelatedProductsProps {
  items: Product[];
}

export function RelatedProducts({ items }: RelatedProductsProps) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-6">
      <h2 className="type-section-heading">You might also like</h2>
      <ul className={productGridClassName}>
        {items.map((product) => (
          <li key={product.id}>
            <NextProductCard product={product} fullProduct={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
