'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Subscribes to the auth store and bootstraps the session on first mount.
 * Components only need to call this once near the app root; consumers can
 * then read from `useAuthStore`.
 */
export function useSessionBootstrap(): void {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) void bootstrap();
  }, [bootstrap, hasHydrated]);
}

export function useSession() {
  return {
    user: useAuthStore((s) => s.user),
    status: useAuthStore((s) => s.status),
    isAuthenticated: useAuthStore((s) => s.status === 'authenticated' && s.user !== null),
    isLoading: useAuthStore((s) => s.status === 'loading' || (s.status === 'idle' && !s.hasHydrated)),
    hasHydrated: useAuthStore((s) => s.hasHydrated),
  };
}
