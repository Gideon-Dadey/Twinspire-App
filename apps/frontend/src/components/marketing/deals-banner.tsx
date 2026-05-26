import { Button, Reveal } from '@twinspire/ui';
import { Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function DealsBanner() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-secondary text-secondary-foreground">
          <div className="grid items-center gap-6 px-6 py-10 md:grid-cols-2 md:px-12 md:py-16 lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <Sparkles className="size-3.5" aria-hidden /> Holiday flash sale
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Save up to <span className="text-accent">40% off</span> across all of TwinSpire.
              </h2>
              <p className="mt-4 max-w-md text-secondary-foreground/70">
                Use code{' '}
                <span className="rounded-md bg-secondary-foreground/10 px-2 py-1 font-mono text-sm font-semibold text-secondary-foreground">
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
                <Button asChild size="lg" variant="ghost" className="text-secondary-foreground hover:bg-secondary-foreground/10">
                  <Link href="/new-arrivals">See new arrivals</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-banner overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1800&q=70"
                alt="Holiday deals collage"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-secondary/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
