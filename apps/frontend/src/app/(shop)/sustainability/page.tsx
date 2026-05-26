import type { Metadata } from 'next';

import { StubPage } from '@/components/shop/stub-page';

export const metadata: Metadata = {
  title: 'Sustainability',
  description: 'Carbon-neutral shipping, trade-ins, and recycled packaging.',
  alternates: { canonical: '/sustainability' },
};

export default function SustainabilityPage() {
  return (
    <StubPage
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sustainability' }]}
      eyebrow="Sustainability"
      title="Less impact, more impact."
      description="We aren't perfect, but we're transparent about where we are and where we want to be."
    >
      <ul className="ml-5 list-disc space-y-2">
        <li>Every shipment is carbon-offset via Pachama.</li>
        <li>97% of our packaging is recycled or compostable.</li>
        <li>Trade-in program: get up to 60% credit for used gear, refurbished or recycled responsibly.</li>
        <li>Our Reno warehouse runs on 100% renewable energy.</li>
      </ul>
    </StubPage>
  );
}
