'use client';

import { Button, Spinner } from '@twinspire/ui';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { useSession } from '@/lib/hooks/use-session';

const STAFF_ROLES = new Set(['admin', 'superadmin', 'manager', 'staff', 'support']);

/**
 * Client-side guard for every /admin/* route.
 *
 * 1. While the session is hydrating we show a centered spinner.
 * 2. If the user is not signed in we redirect to /login with a returnTo.
 * 3. If the user is signed in but lacks staff privileges we render an
 *    accessible 403 panel instead of redirecting — that way the user can
 *    still navigate back to the storefront without losing their tab.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, hasHydrated } = useSession();
  const router = useRouter();

  const isStaff = Boolean(user && STAFF_ROLES.has(user.role));

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const returnTo =
        typeof window !== 'undefined'
          ? `?returnTo=${encodeURIComponent(window.location.pathname)}`
          : '';
      router.replace(`/login${returnTo}`);
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || (isAuthenticated && !user)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
        <Spinner aria-label="Loading the admin console" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!isStaff) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold text-foreground">Restricted area</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          You’re signed in as <strong>{user?.email}</strong>, but this section is reserved for
          TwinSpire staff. If you believe this is a mistake, contact your administrator.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Return to storefront</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account">Go to your account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
