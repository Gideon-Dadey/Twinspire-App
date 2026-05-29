'use client';

import { Spinner } from '@twinspire/ui';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { useSession } from '@/lib/hooks/use-session';

export function AuthGuard({ children, redirectTo }: { children: ReactNode; redirectTo?: string }) {
  const { isAuthenticated, hasHydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const search = redirectTo
        ? `?returnTo=${encodeURIComponent(redirectTo)}`
        : typeof window !== 'undefined'
          ? `?returnTo=${encodeURIComponent(window.location.pathname)}`
          : '';
      router.replace(`/login${search}`);
    }
  }, [hasHydrated, isAuthenticated, redirectTo, router]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" aria-live="polite">
        <Spinner aria-label="Loading your account" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
