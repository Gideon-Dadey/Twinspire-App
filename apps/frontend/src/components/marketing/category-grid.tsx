import { AspectRatio, Reveal, Stagger, StaggerItem, cn } from '@twinspire/ui';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { primaryCategories } from '@/lib/site-config';

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary text-sm font-medium uppercase tracking-wider">
              Shop by category
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need.
            </h2>
          </div>
          <Link
            href="/categories"
            className={cn(
              'text-muted-foreground inline-flex w-fit items-center gap-1 text-sm font-medium transition-colors',
              'hover:text-foreground',
            )}
          >
            See all categories →
          </Link>
        </header>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" stagger={0.04}>
        {primaryCategories.map(({ slug, name, tagline, image, imageAlt }) => (
          <StaggerItem key={slug}>
            <Link
              href={`/${slug}`}
              className={cn(
                'border-border bg-card group flex h-full flex-col overflow-hidden rounded-lg border',
                'shadow-xs duration-moderate ease-spring transition-all',
                'hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg',
                'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              )}
            >
              <AspectRatio ratio={4 / 3} className="bg-muted overflow-hidden">
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw"
                  className="duration-moderate object-cover transition-transform ease-out group-hover:scale-[1.05]"
                />
                <div
                  aria-hidden
                  className="duration-moderate pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
              </AspectRatio>

              <div className="border-border/60 flex flex-1 items-start justify-between gap-2 border-t p-3.5">
                <div className="min-w-0">
                  <div className="text-foreground truncate text-sm font-semibold">{name}</div>
                  <div className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{tagline}</div>
                </div>
                <ArrowUpRight
                  className="text-muted-foreground duration-moderate group-hover:text-primary mt-0.5 size-4 shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
