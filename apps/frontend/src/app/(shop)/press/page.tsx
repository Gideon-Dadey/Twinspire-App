import type { Metadata } from 'next';

import { StubPage } from '@/components/shop/stub-page';

export const metadata: Metadata = {
  title: 'Press',
  description: 'TwinSpire press resources, brand assets, and recent coverage.',
  alternates: { canonical: '/press' },
};

export default function PressPage() {
  return (
    <StubPage
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Press' }]}
      eyebrow="Press"
      title="Press kit & recent coverage."
      description="Brand assets, executive bios, and recent media coverage. For interviews, email press@twinspire.com."
    >
      <p>
        Download our logo pack and brand guidelines from the press kit link. All assets are
        royalty-free for editorial use.
      </p>
    </StubPage>
  );
}
