import { Reveal, Stagger, StaggerItem } from '@twinspire/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { NextProductCard } from '@/components/shared/product-card';
import { getBestSellersList } from '@/lib/catalog/catalog-service';

export async function BestSellers() {
  const items = await getBestSellersList(8);

  return (
    <section className="bg-muted/30 py-10 sm:py-14 md:py-24">
      <div className="container mx-auto px-3 sm:px-4">
        <Reveal>
          <header className="mb-6 flex flex-col gap-3 sm:mb-8 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-accent text-sm font-medium uppercase tracking-wider">
                Customer favorites
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Best sellers this season.
              </h2>
            </div>
            <Link
              href="/best-sellers"
              className="text-muted-foreground hover:text-foreground group inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
            >
              Browse all best sellers
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </header>
        </Reveal>

        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((product) => (
            <StaggerItem key={product.id}>
              <NextProductCard product={product} fullProduct={product} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
