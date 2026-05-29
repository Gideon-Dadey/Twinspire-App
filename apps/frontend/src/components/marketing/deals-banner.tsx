import { Button, Reveal } from '@twinspire/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { DealsBannerAdCarousel } from '@/components/marketing/deals-banner-ad-carousel';

export function DealsBanner() {
  return (
    <section className="container mx-auto px-3 py-10 sm:px-4 sm:py-14 md:py-24">
      <Reveal>
        <div className="bg-secondary text-secondary-foreground relative overflow-hidden rounded-lg">
          <div className="grid items-stretch md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="flex min-w-0 flex-col justify-center px-4 py-8 sm:px-6 md:px-10 md:py-14 lg:px-12 lg:py-20">
              <header className="max-w-xl">
                <p className="text-secondary-foreground/75 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
                  Save up to
                </p>
                <p className="font-display text-accent mt-2 text-[clamp(2.75rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-tight">
                  40% off
                </p>
                <h2 className="font-display text-secondary-foreground mt-3 text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl md:text-[2rem] md:leading-tight lg:text-4xl">
                  across all of TwinSpire.
                </h2>
              </header>
              <p className="text-secondary-foreground/70 mt-5 max-w-md text-pretty text-sm leading-relaxed sm:text-base">
                Use code{' '}
                <span className="bg-secondary-foreground/10 text-secondary-foreground rounded-md px-2 py-1 font-mono text-sm font-semibold">
                  WELCOME10
                </span>{' '}
                at checkout for an extra 10% off your first order — stackable with sale prices.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/deals">
                    Shop the sale
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-secondary-foreground hover:bg-secondary-foreground/10"
                >
                  <Link href="/new-arrivals">See new arrivals</Link>
                </Button>
              </div>
            </div>
            <DealsBannerAdCarousel />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
