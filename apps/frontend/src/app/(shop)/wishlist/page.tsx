import type { Metadata } from 'next';

import { PublicWishlistGate } from '@/components/account/public-wishlist-gate';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Your saved products on TwinSpire.',
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <PublicWishlistGate />;
}
