'use client';

import { Button, cn } from '@twinspire/ui';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { HERO_SLIDES, type HeroSlide } from '@/lib/hero-slides';

const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD = 80;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export function HeroCarousel({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const total = slides.length;
  const announceRef = React.useRef<HTMLDivElement>(null);

  const goTo = React.useCallback(
    (next: number, hint: 1 | -1 = 1) => {
      setDirection(hint);
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const next = React.useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1, -1), [goTo, index]);

  React.useEffect(() => {
    if (paused || reducedMotion || total < 2) return;
    const id = window.setInterval(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, total]);

  React.useEffect(() => {
    function onVisibilityChange() {
      setPaused(document.hidden);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    }
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) next();
    else if (info.offset.x > SWIPE_THRESHOLD) prev();
  }

  const slide = slides[index];
  if (!slide) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="border-border bg-background relative isolate w-full overflow-hidden border-b"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKey}
      tabIndex={0}
    >
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${index + 1} of ${total}: ${slide.title}`}
      </div>

      {/*
       * Hero height — mobile uses min-height so copy + CTAs fit comfortably;
       * desktop keeps a fixed stage.
       */}
      <div className="relative min-h-[480px] w-full sm:min-h-[520px] md:min-h-[560px] lg:h-[600px] lg:min-h-0 xl:h-[640px]">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: reducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.4 },
            }}
            drag={reducedMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn('absolute inset-0', slide.background)}
          >
            {/*
             * Slide layout
             *
             * Mobile (< lg): full-bleed image band (edge-to-edge, no side
             * padding) with copy in a padded container below — matches Apple
             * Store / Stripe / SaaS mobile hero patterns.
             *
             * Desktop (lg+): two-column grid with text left, product art right.
             */}
            <div className="flex h-full flex-col lg:container lg:mx-auto lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:px-4">
              {/* IMAGE — full viewport width on mobile; column art on desktop */}
              <div className="relative h-[200px] w-full shrink-0 overflow-hidden sm:h-[240px] md:h-[280px] lg:order-2 lg:flex lg:h-full lg:items-center lg:justify-center lg:overflow-visible">
                <div className="relative h-full w-full lg:max-w-xl">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="object-cover object-center lg:object-contain lg:object-center lg:drop-shadow-2xl"
                    priority={index === 0}
                  />
                </div>
                {/* Soft fade into content area on small screens */}
                <div
                  aria-hidden
                  className="from-background/80 pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent lg:hidden"
                />
              </div>

              {/* COPY — container-aligned on mobile; grid cell on desktop */}
              <div className="container relative z-10 mx-auto flex w-full min-w-0 flex-1 flex-col items-start justify-start px-3 pt-4 sm:px-4 sm:pt-5 lg:order-1 lg:max-w-2xl lg:flex-none lg:justify-center lg:px-0 lg:pt-0">
                <div className="flex w-full max-w-xl flex-col gap-3 sm:gap-3.5 lg:max-w-2xl lg:gap-5">
                  <div className="flex w-full flex-col gap-1.5 sm:gap-2.5">
                    {/*
                     * Mobile headline: 24px (text-2xl) — matches Apple Store,
                     * Amazon, and SaaS mobile hero scale. Scales up at sm/md/lg.
                     */}
                    <h1 className="type-hero-heading">{slide.title}</h1>

                    <p className="text-muted-foreground text-pretty text-sm leading-5 sm:text-base sm:leading-6 lg:max-w-xl lg:text-lg lg:leading-7">
                      {slide.subtitle}
                    </p>

                    {slide.note ? (
                      <p className="text-foreground/60 text-xs leading-snug sm:text-sm">
                        {slide.note}
                      </p>
                    ) : null}
                  </div>

                  {/* CTAs — full-width stacked on phone, inline from sm */}
                  <div className="flex w-full flex-col gap-2.5 pt-0.5 sm:flex-row sm:items-center sm:gap-3 sm:pt-1">
                    <Button
                      asChild
                      size="lg"
                      rounded="full"
                      fullWidth
                      className="h-11 w-full font-semibold sm:w-auto sm:min-w-[9.5rem] sm:px-7"
                    >
                      <Link href={slide.cta.href}>{slide.cta.label}</Link>
                    </Button>
                    {slide.ctaSecondary ? (
                      <Button
                        asChild
                        size="lg"
                        rounded="full"
                        variant="outline"
                        fullWidth
                        className="border-border bg-background/80 h-11 w-full font-semibold backdrop-blur-sm sm:w-auto sm:min-w-[9.5rem] sm:px-7"
                      >
                        <Link href={slide.ctaSecondary.href}>{slide.ctaSecondary.label}</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/*
       * Prev / Next controls.
       *
       * Hidden on mobile (< md): with the new stacked layout the chevrons
       * would overlap the image card. Mobile users navigate via the bottom
       * pagination dots and the existing swipe gesture (framer-motion drag
       * + SWIPE_THRESHOLD handler). This matches the Amazon, Apple Store,
       * and Jumia mobile carousel pattern.
       */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between px-2 sm:px-4 md:flex">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className={cn(
            'border-border/60 bg-background/80 text-foreground pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-md backdrop-blur transition',
            'hover:bg-background focus-visible:ring-ring hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2',
          )}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className={cn(
            'border-border/60 bg-background/80 text-foreground pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-md backdrop-blur transition',
            'hover:bg-background focus-visible:ring-ring hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2',
          )}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}
