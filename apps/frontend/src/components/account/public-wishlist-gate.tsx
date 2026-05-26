'use client';

import { Breadcrumb, Button, Spinner } from '@twinspire/ui';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { useSession } from '@/lib/hooks/use-session';

/**
 * Public-facing /wishlist surface. Authenticated users are routed to
 * /account/wishlist; guests see a sign-in prompt without leaving the
 * shop chrome.
 */
export function PublicWishlistGate() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useSession();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace('/account/wishlist');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || isAuthenticated) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-12">
        <Spinner aria-label="Loading your wishlist" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-8"
      />
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <span
          aria-hidden
          className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Heart className="size-7" />
        </span>
        <h1 className="mt-4 text-2xl font-display font-semibold tracking-tight">Your wishlist lives here</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to save products across devices, see price drop alerts, and keep your favourites in
          one place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/login?returnTo=${encodeURIComponent('/wishlist')}`}>Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Already saved items on this device? Sign in and we&apos;ll merge them automatically.
        </p>
      </div>
    </div>
  );
}
