import { Badge, Button, cn, FadeIn, Reveal, Stagger, StaggerItem } from '@twinspire/ui';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import Link from 'next/link';

const highlights = [
  { icon: ShieldCheck, label: 'Authentic & warrantied' },
  { icon: Truck, label: 'Free 2-day shipping' },
  { icon: Zap, label: 'Same-day pickup' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="container relative mx-auto flex flex-col items-center gap-10 px-4 py-20 text-center md:py-28 lg:py-32">
        <FadeIn>
          <Badge variant="muted" size="md" className="border border-border bg-background/70 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-accent" aria-hidden />
            <span className="uppercase tracking-wider">Holiday flash sale · up to 40% off</span>
          </Badge>
        </FadeIn>

        <Reveal>
          <h1
            className={cn(
              'max-w-4xl text-balance font-display text-4xl font-bold tracking-tight',
              'sm:text-5xl md:text-6xl lg:text-7xl',
            )}
          >
            The electronics store that{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              actually keeps up
            </span>
            .
          </h1>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg md:text-xl">
            Phones, laptops, gaming gear, TVs, components, and accessories — from the brands you
            trust, delivered fast, backed by real humans.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild size="xl" rounded="full">
              <Link href="/deals">
                Shop today&apos;s deals
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="xl" rounded="full" variant="outline">
              <Link href="/phones">Browse new arrivals</Link>
            </Button>
          </div>
        </Reveal>

        <Stagger className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          {highlights.map(({ icon: Icon, label }) => (
            <StaggerItem key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" aria-hidden />
              <span>{label}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
