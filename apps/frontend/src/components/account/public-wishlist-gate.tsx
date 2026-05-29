'use client';

import { Breadcrumb, Button, Spinner } from '@twinspire/ui';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { useSession } from '@/lib/hooks/use-session';

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
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-3 py-12 sm:px-4">
        <Spinner aria-label="Loading your wishlist" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-10 sm:px-4 sm:py-14">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-8"
      />
      <div className="border-border bg-card mx-auto max-w-xl rounded-lg border p-10 text-center shadow-sm">
        <span
          aria-hidden
          className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-full"
        >
          <Heart className="size-7" />
        </span>
        <h1 className="type-page-heading mt-4 font-semibold">Your wishlist lives here</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Sign in to save products across devices, see price drop alerts, and keep your favourites
          in one place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/login?returnTo=${encodeURIComponent('/wishlist')}`}>Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-6 text-xs">
          Already saved items on this device? Sign in and we&apos;ll merge them automatically.
        </p>
      </div>
    </div>
  );
}
