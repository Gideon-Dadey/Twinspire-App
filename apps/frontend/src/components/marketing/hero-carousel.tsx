'use client';

import { Badge, Button, cn } from '@twinspire/ui';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
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

export function HeroCarousel({
  slides = HERO_SLIDES,
}: {
  slides?: HeroSlide[];
}) {
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
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
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
      className="relative isolate w-full overflow-hidden border-b border-border bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKey}
      tabIndex={0}
    >
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {`Slide ${index + 1} of ${total}: ${slide.title}`}
      </div>

      <div className="relative h-[520px] w-full sm:h-[560px] md:h-[600px] lg:h-[640px]">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: reducedMotion
                ? { duration: 0 }
                : { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.4 },
            }}
            drag={reducedMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn('absolute inset-0', slide.background)}
          >
            <div className="container mx-auto grid h-full grid-cols-1 items-center gap-8 px-4 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
              <div className="relative z-10 flex max-w-2xl flex-col items-start justify-center gap-5 py-10 text-left lg:py-0">
                <Badge
                  variant="muted"
                  size="md"
                  className="border border-border bg-background/80 px-3 py-1 backdrop-blur"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-current',
                      slide.accent,
                    )}
                  />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">
                    {slide.eyebrow}
                  </span>
                </Badge>

                <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl lg:text-[3.75rem] xl:text-[4.25rem]">
                  {slide.title}
                </h1>

                <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
                  {slide.subtitle}
                </p>

                {slide.note ? (
                  <p className="text-sm font-medium text-foreground/70">
                    {slide.note}
                  </p>
                ) : null}

                <div className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Button asChild size="lg" rounded="full">
                    <Link href={slide.cta.href}>{slide.cta.label}</Link>
                  </Button>
                  {slide.ctaSecondary ? (
                    <Button asChild size="lg" rounded="full" variant="outline">
                      <Link href={slide.ctaSecondary.href}>
                        {slide.ctaSecondary.label}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="relative hidden h-full items-center justify-center lg:flex">
                <div className="relative h-[80%] w-full max-w-xl">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1280px) 600px, (min-width: 1024px) 500px, 100vw"
                    className="object-contain object-center drop-shadow-2xl"
                    priority={index === 0}
                  />
                </div>
              </div>

              {/* Mobile / tablet image: positioned absolutely as a subtle backdrop */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-50 sm:flex md:opacity-60 lg:hidden"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-contain object-right-bottom"
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next controls — large hit targets, hidden on tiny screens */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 sm:px-4">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className={cn(
            'pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-md backdrop-blur transition',
            'hover:bg-background hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className={cn(
            'pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-md backdrop-blur transition',
            'hover:bg-background hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Pagination + play/pause */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-4 sm:bottom-6">
        <div
          role="tablist"
          aria-label="Choose a slide"
          className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 shadow-sm backdrop-blur"
        >
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={active}
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                type="button"
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={cn(
                  'group relative h-2 rounded-full transition-all duration-300',
                  active ? 'w-8 bg-foreground' : 'w-2 bg-foreground/30 hover:bg-foreground/60',
                )}
              >
                <span className="sr-only">Slide {i + 1}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume autoplay' : 'Pause autoplay'}
            className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition hover:bg-muted hover:text-foreground"
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
