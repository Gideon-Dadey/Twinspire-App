import type { Metadata } from 'next';

import { StubPage } from '@/components/shop/stub-page';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join TwinSpire — engineering, design, content, and operations roles.',
  alternates: { canonical: '/careers' },
};

export default function CareersPage() {
  return (
    <StubPage
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Careers' }]}
      eyebrow="Careers"
      title="Help us redefine the electronics store."
      description="We're hiring engineers, designers, and reviewers across the US and remote. Full benefits, 4-day weeks, and a hardware budget."
      primaryAction={{ label: 'Open positions (Greenhouse)', href: '#' }}
    >
      <p>
        Our editorial team is fully independent — we don't accept sponsored reviews. Our
        engineering team ships code daily. Our customer-success team is paid on resolved
        tickets, not call time.
      </p>
    </StubPage>
  );
}
