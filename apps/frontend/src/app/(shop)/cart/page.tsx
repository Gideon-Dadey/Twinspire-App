import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { CartPageContent } from '@/components/shop/cart/cart-page-content';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review your TwinSpire cart before checkout.',
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Your cart
      </h1>

      <CartPageContent />
    </div>
  );
}
