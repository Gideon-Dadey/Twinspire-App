import { Reveal, Stagger, StaggerItem } from '@twinspire/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { NextProductCard } from '@/components/shared/product-card';
import { getNewArrivals } from '@/data/products';

export function FeaturedProducts() {
  const items = getNewArrivals(4);

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Featured this week
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Just landed.
            </h2>
          </div>
          <Link
            href="/new-arrivals"
            className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            See all new arrivals
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </header>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <StaggerItem key={product.id}>
            <NextProductCard product={product} fullProduct={product} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
