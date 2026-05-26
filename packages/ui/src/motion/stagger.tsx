'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import * as React from 'react';

import { usePrefersReducedMotion } from '../lib/hooks/use-media-query';

import { slideUp, staggerContainer } from './presets';

export interface StaggerProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate'> {
  /** Delay between children (default `0.05`). */
  stagger?: number;
}

/** Container that staggers its motion-enabled children. */
export function Stagger({ children, stagger = 0.06, ...props }: StaggerProps): React.JSX.Element {
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
      whileInView="animate"
      viewport={{ once: true, margin: '-60px' }}
      variants={staggerContainer(stagger)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Child of a `<Stagger>` that fades up when its parent triggers. */
export const StaggerItem = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  function StaggerItem({ children, variants, ...props }, ref) {
    return (
      <motion.div ref={ref} variants={variants ?? slideUp} {...props}>
        {children}
      </motion.div>
    );
  },
);
