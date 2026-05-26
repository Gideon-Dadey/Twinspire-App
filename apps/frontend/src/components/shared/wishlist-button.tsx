'use client';

import { Button, cn } from '@twinspire/ui';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useSession } from '@/lib/hooks/use-session';
import {
  useAddToWishlist,
  useIsInWishlist,
  useRemoveFromWishlist,
} from '@/lib/hooks/use-wishlist';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  variant?: 'icon' | 'inline';
}

export function WishlistButton({ productId, className, variant = 'icon' }: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useSession();
  const isSaved = useIsInWishlist(productId);
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();
  const pending = add.isPending || remove.isPending;

  function handleClick() {
    if (!isAuthenticated) {
      toast.message('Sign in to save items', {
        description: "We'll bring you right back to this product.",
        action: {
          label: 'Sign in',
          onClick: () => router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`),
        },
      });
      return;
    }
    if (isSaved) remove.mutate(productId);
    else add.mutate(productId);
  }

  if (!hasHydrated && variant === 'icon') {
    // Server-rendered fallback to avoid hydration flicker.
    return null;
  }

  if (variant === 'inline') {
    return (
      <Button
        type="button"
        variant={isSaved ? 'secondary' : 'outline'}
        onClick={handleClick}
        loading={pending}
        className={className}
      >
        <Heart className={cn('size-4', isSaved && 'fill-current text-destructive')} aria-hidden />
        {isSaved ? 'Saved' : 'Save'}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isSaved}
      className={cn(
        'rounded-full bg-background/80 backdrop-blur hover:bg-background',
        pending && 'opacity-60',
        className,
      )}
    >
      <Heart className={cn('size-4', isSaved && 'fill-current text-destructive')} aria-hidden />
    </Button>
  );
}
