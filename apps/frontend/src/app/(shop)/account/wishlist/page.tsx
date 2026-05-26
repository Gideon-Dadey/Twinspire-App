import type { Metadata } from 'next';

import { WishlistPageContent } from '@/components/account/wishlist-page-content';

export const metadata: Metadata = {
  title: 'Your wishlist',
  description: 'Items you saved for later.',
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return <WishlistPageContent />;
}
