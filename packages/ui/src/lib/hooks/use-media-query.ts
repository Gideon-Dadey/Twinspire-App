'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query.
 *
 * SSR-safe — defaults to `false` until the first client effect runs.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mql = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

export const useIsMobile = (): boolean => useMediaQuery('(max-width: 767px)');
export const useIsTablet = (): boolean =>
  useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');
