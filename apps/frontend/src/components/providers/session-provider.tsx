'use client';

import { type ReactNode } from 'react';

import { useSessionBootstrap } from '@/lib/hooks/use-session';

/**
 * Mounts once near the root of the tree to hydrate the auth store from the
 * mock backend (or `/auth/me` against the real API).
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  useSessionBootstrap();
  return <>{children}</>;
}
