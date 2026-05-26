'use client';

import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

import { usePrefersReducedMotion } from '../lib/hooks/use-media-query';

import { durations, easing } from './presets';

export interface PageTransitionProps extends Omit<HTMLMotionProps<'main'>, 'children'> {
  /** Stable key so AnimatePresence knows to re-mount on route change. */
  pageKey: string;
  children: React.ReactNode;
}

/**
 * Wrap the route's root element to get a tasteful cross-fade between pages.
 *
 *   <PageTransition pageKey={pathname}>
 *     {children}
 *   </PageTransition>
 */
export function PageTransition({ pageKey, children, ...props }: PageTransitionProps): React.JSX.Element {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return (
      <main {...(props as React.HTMLAttributes<HTMLElement>)} key={pageKey}>
        {children}
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pageKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: durations.moderate, ease: easing.spring }}
        {...props}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
