'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  EmptyState,
  Skeleton,
} from '@twinspire/ui';
import { Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { NextProductCard } from '@/components/shared/product-card';
import { useClearWishlist, useWishlistQuery } from '@/lib/hooks/use-wishlist';

export function WishlistPageContent() {
  const { data, isLoading } = useWishlistQuery();
  const clear = useClearWishlist();

  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Your wishlist"
        description="Bookmark anything that caught your eye — and grab it when you're ready."
        actions={
          data?.items.length ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  <Trash2 aria-hidden />
                  Clear wishlist
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your wishlist?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every saved item. You can always save them again from the product
                    page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clear.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {data.items.map((item) => (
            <NextProductCard key={item.id} product={item.product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved items yet"
          description="Tap the heart icon on any product to save it for later."
          action={
            <Button asChild>
              <Link href="/deals">Browse deals</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
