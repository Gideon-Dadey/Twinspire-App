import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { CheckoutFlow } from '@/components/shop/checkout/checkout-flow';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Securely complete your TwinSpire order.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-3 pb-20 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout' },
        ]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <h1 className="font-display mb-8 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
        Checkout
      </h1>

      <CheckoutFlow />
    </div>
  );
}
