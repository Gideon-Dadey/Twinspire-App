'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { DEALS_AD_SLIDES } from '@/lib/deals-ad-slides';

const ROTATE_MS = 4500;

export function DealsBannerAdCarousel() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const total = DEALS_AD_SLIDES.length;

  React.useEffect(() => {
    if (reducedMotion || paused || total < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, total]);

  const slide = DEALS_AD_SLIDES[index];
  if (!slide) return null;

  return (
    <div
      className="group relative h-52 w-full overflow-hidden sm:h-64 md:h-full md:min-h-[18rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Promotion ${index + 1} of ${total}: ${slide.headline}`}
      </div>

      {DEALS_AD_SLIDES.map((item, i) => (
        <motion.div
          key={item.id}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.65, ease: 'easeInOut' }}
          aria-hidden={i !== index}
        >
          <Link
            href={item.href}
            tabIndex={i === index ? 0 : -1}
            className="relative block h-full w-full"
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
              priority={i === 0}
            />
            <div className="from-secondary/80 via-secondary/20 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <span className="bg-primary text-primary-foreground mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Deal
              </span>
              <p className="font-display text-secondary-foreground text-lg font-bold leading-tight sm:text-xl">
                {item.headline}
              </p>
              {item.tagline ? (
                <p className="text-secondary-foreground/80 mt-1 text-sm">{item.tagline}</p>
              ) : null}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
