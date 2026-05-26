'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { WishlistResponse } from '@/lib/api/types';

export const wishlistKeys = {
  list: ['account', 'wishlist'] as const,
  recent: ['account', 'recently-viewed'] as const,
};

export function useWishlistQuery() {
  const isAuthed = useAuthStore((s) => s.status === 'authenticated' && s.user !== null);
  return useQuery({
    queryKey: wishlistKeys.list,
    queryFn: () => api.wishlist.list(),
    enabled: isAuthed,
  });
}

export function useIsInWishlist(productId: string): boolean {
  const { data } = useWishlistQuery();
  return Boolean(data?.items.some((item) => item.productId === productId));
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.wishlist.add(productId),
    onSuccess: ({ productId }) => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
      toast.success('Added to wishlist', {
        description: 'View your saved items in your account.',
        id: `wishlist-${productId}`,
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not save to wishlist');
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => api.wishlist.remove(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.list });
      const previous = queryClient.getQueryData<WishlistResponse>(wishlistKeys.list);
      if (previous) {
        queryClient.setQueryData<WishlistResponse>(wishlistKeys.list, {
          ...previous,
          items: previous.items.filter((item) => item.productId !== productId),
          total: Math.max(0, previous.total - 1),
        });
      }
      return { previous };
    },
    onError: (err: Error, _productId, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(wishlistKeys.list, ctx.previous);
      toast.error(err.message || 'Could not remove from wishlist');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
    },
  });
}

export function useClearWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.wishlist.clear(),
    onSuccess: () => {
      queryClient.setQueryData<WishlistResponse>(wishlistKeys.list, { items: [], total: 0 });
      toast.success('Wishlist cleared');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not clear wishlist');
    },
  });
}

export function useRecentlyViewedQuery() {
  const isAuthed = useAuthStore((s) => s.status === 'authenticated' && s.user !== null);
  return useQuery({
    queryKey: wishlistKeys.recent,
    queryFn: () => api.wishlist.recentlyViewed(),
    enabled: isAuthed,
  });
}
