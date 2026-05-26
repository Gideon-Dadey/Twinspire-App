import { Reveal, Stagger, StaggerItem, cn } from '@twinspire/ui';
import {
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  Smartphone,
  Tv,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { primaryCategories } from '@/lib/site-config';

const ICONS: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Tv,
  Gamepad2,
  Cpu,
  Headphones,
};

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Shop by category
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need.
            </h2>
          </div>
          <Link
            href="/categories"
            className={cn(
              'inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground transition-colors',
              'hover:text-foreground',
            )}
          >
            See all categories →
          </Link>
        </header>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6" stagger={0.04}>
        {primaryCategories.map(({ slug, name, tagline, icon }) => {
          const Icon = ICONS[icon] ?? Smartphone;
          return (
            <StaggerItem key={slug}>
              <Link
                href={`/${slug}`}
                className={cn(
                  'group flex h-full flex-col items-start gap-3 rounded-lg border border-border bg-card p-5',
                  'shadow-xs transition-all duration-moderate ease-spring',
                  'hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-lg',
                    'bg-primary/10 text-primary transition-colors',
                    'group-hover:bg-primary group-hover:text-primary-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{tagline}</div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
