import type { Transition, Variants } from 'framer-motion';

/**
 * Centralized Framer Motion presets so the entire app shares the same
 * easing / duration vocabulary as the Tailwind tokens.
 */
export const easing = {
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: [0.16, 1, 0.3, 1],
} as const;

export const durations = {
  fastest: 0.075,
  fast: 0.15,
  base: 0.2,
  moderate: 0.3,
  slow: 0.5,
  slower: 0.75,
} as const;

export const springs = {
  soft: { type: 'spring', stiffness: 200, damping: 24 } as Transition,
  snappy: { type: 'spring', stiffness: 380, damping: 28 } as Transition,
  bouncy: { type: 'spring', stiffness: 320, damping: 16 } as Transition,
} as const;

/* ---------- Variants ---------- */

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: durations.base, ease: easing.out } },
  exit: { opacity: 0, transition: { duration: durations.fast, ease: easing.in } },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: durations.moderate, ease: easing.spring } },
  exit: { opacity: 0, y: 8, transition: { duration: durations.fast, ease: easing.in } },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { duration: durations.moderate, ease: easing.spring } },
  exit: { opacity: 0, y: -8, transition: { duration: durations.fast, ease: easing.in } },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: durations.moderate, ease: easing.spring } },
  exit: { opacity: 0, x: -16, transition: { duration: durations.fast, ease: easing.in } },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: durations.moderate, ease: easing.spring } },
  exit: { opacity: 0, x: 16, transition: { duration: durations.fast, ease: easing.in } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: durations.moderate, ease: easing.spring } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: durations.fast, ease: easing.in } },
};

export const staggerContainer = (delay = 0.05): Variants => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: delay,
      delayChildren: delay,
    },
  },
});

export const pop: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: springs.bouncy },
};

/** Hero/jumbotron entrance with subtle parallax. */
export const heroIntro: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing.spring } },
};

export const presets = {
  fadeIn,
  slideUp,
  slideDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  pop,
  heroIntro,
  staggerContainer,
};
