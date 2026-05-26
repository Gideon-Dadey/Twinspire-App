import { Reveal } from '@twinspire/ui';
import Link from 'next/link';

import { getFeaturedBrands } from '@/data/brands';

export function BrandStrip() {
  const brands = getFeaturedBrands(6);
  return (
    <section className="border-y border-border bg-card">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <Reveal>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground md:text-left">
              Brands you trust, in stock today
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:gap-x-10">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="font-display text-lg font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
