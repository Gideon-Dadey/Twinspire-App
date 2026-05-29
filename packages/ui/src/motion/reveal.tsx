'use client';

import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { slideUp } from './presets';

export interface RevealProps extends Omit<
  HTMLMotionProps<'div'>,
  'variants' | 'initial' | 'animate'
> {
  /** Triggered when scrolled into view; defaults to true. */
  inView?: boolean;
  delay?: number;
}

/**
 * Lightweight scroll-triggered reveal — fades + lifts on first intersection.
 * Honors `prefers-reduced-motion` automatically.
 */
export function Reveal({
  children,
  delay = 0,
  inView = true,
  transition,
  ...props
}: RevealProps): React.JSX.Element {
  const [mounted, setMounted] = React.useState(false);
  const prefersReduced = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // SSR and the first client paint must match — motion prefs are read after mount.
  if (!mounted || prefersReduced) {
    return (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
    );
  }
  return (
    <motion.div
      initial="initial"
      whileInView={inView ? 'animate' : undefined}
      viewport={{ once: true, margin: '-80px' }}
      variants={slideUp}
      transition={{ delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
