'use client';

import type { Product } from '@twinspire/types';
import { ProductCard as UIProductCard, type ProductCardProps } from '@twinspire/ui';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { useSession } from '@/lib/hooks/use-session';
import {
  useAddToWishlist,
  useIsInWishlist,
  useRemoveFromWishlist,
} from '@/lib/hooks/use-wishlist';
import { useCartStore } from '@/lib/stores/cart-store';

import { NextImageProductCard, NextLinkProductCard } from './next-adapters';

export interface NextProductCardProps
  extends Omit<
    ProductCardProps,
    'linkComponent' | 'imageComponent' | 'onAddToCart' | 'onAddToWishlist' | 'inWishlist'
  > {
  /** Pass the full product object so the cart store can hold the canonical record. */
  fullProduct?: Product;
}

export function NextProductCard({
  product,
  fullProduct,
  ...rest
}: NextProductCardProps): React.JSX.Element {
  const router = useRouter();
  const addProduct = useCartStore((s) => s.addProduct);
  const { isAuthenticated } = useSession();
  const inWishlist = useIsInWishlist(product.id);
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();

  function handleAddToCart() {
    if (!fullProduct) {
      toast.info(`Open ${product.name} to choose options`);
      return;
    }
    addProduct(fullProduct, 1);
    toast.success(`${product.name} added to cart`);
  }

  function handleWishlist() {
    if (!isAuthenticated) {
      toast.message('Sign in to save items', {
        description: "We'll bring you right back.",
        action: {
          label: 'Sign in',
          onClick: () =>
            router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`),
        },
      });
      return;
    }
    if (inWishlist) remove.mutate(product.id);
    else add.mutate(product.id);
  }

  return (
    <UIProductCard
      product={product}
      linkComponent={NextLinkProductCard}
      imageComponent={NextImageProductCard}
      onAddToCart={handleAddToCart}
      onAddToWishlist={handleWishlist}
      inWishlist={inWishlist}
      {...rest}
    />
  );
}
