'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import * as React from 'react';

import { usePrefersReducedMotion } from '../lib/hooks/use-media-query';

import { fadeIn } from './presets';

export interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  delay?: number;
  variants?: Variants;
}

/**
 * Drop-in client component that fades + lifts its children on mount.
 * Respects `prefers-reduced-motion`.
 */
export function FadeIn({
  children,
  delay = 0,
  variants,
  transition,
  ...props
}: FadeInProps): React.JSX.Element {
  const prefersReduced = usePrefersReducedMotion();
  if (prefersReduced) {
    return (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children as React.ReactNode}
      </div>
    );
  }
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants ?? fadeIn}
      transition={{ delay, ...transition }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
