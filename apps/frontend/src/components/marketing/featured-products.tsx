import { Reveal, Stagger, StaggerItem } from '@twinspire/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { NextProductCard } from '@/components/shared/product-card';
import { productGridClassName } from '@/components/shop/product-grid';
import { getNewArrivalsList } from '@/lib/catalog/catalog-service';

export async function FeaturedProducts() {
  const items = await getNewArrivalsList(4);

  return (
    <section className="container mx-auto px-3 py-10 sm:px-4 sm:py-14 md:py-24">
      <Reveal>
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary text-sm font-medium uppercase tracking-wider">
              Featured this week
            </p>
            <h2 className="type-section-heading mt-2">Just landed.</h2>
          </div>
          <Link
            href="/new-arrivals"
            className="text-muted-foreground hover:text-foreground group inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
          >
            See all new arrivals
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </header>
      </Reveal>

      <Stagger className={productGridClassName}>
        {items.map((product) => (
          <StaggerItem key={product.id}>
            <NextProductCard product={product} fullProduct={product} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
