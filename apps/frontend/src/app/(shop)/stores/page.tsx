import type { Metadata } from 'next';

import { StubPage } from '@/components/shop/stub-page';

export const metadata: Metadata = {
  title: 'Stores & pickup',
  description: 'TwinSpire pickup locations across the US.',
  alternates: { canonical: '/stores' },
};

export default function StoresPage() {
  return (
    <StubPage
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Stores' }]}
      eyebrow="Stores"
      title="Same-day pickup at 18 locations."
      description="Order online, pick up in store today. Locations across Austin, Atlanta, Reno, Portland, and Boston metro areas."
    >
      <p>Use the store locator at checkout to find pickup-ready inventory near you.</p>
    </StubPage>
  );
}
