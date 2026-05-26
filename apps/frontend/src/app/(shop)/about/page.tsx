import type { Metadata } from 'next';

import { StubPage } from '@/components/shop/stub-page';

export const metadata: Metadata = {
  title: 'About TwinSpire',
  description: 'Premium electronics, real reviews, and an unusually good return policy.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <StubPage
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      eyebrow="About"
      title="Built by people who actually use this stuff."
      description="TwinSpire is a small, independent electronics retailer with an opinionated team and a 30-day return policy that we promise not to make hard to use."
    >
      <p>
        We are based in Austin, Texas, with warehouses in Reno, NV and Atlanta, GA. We hand-pick
        every product on this site — there is no 3P marketplace, no white-label resellers.
      </p>
      <p className="mt-3">
        Our reviews are written by editors paid on salary, not commission. We don't accept
        sponsored reviews. When we make a buying-guide recommendation, the only criterion is &ldquo;is
        it the best at the price?&rdquo;.
      </p>
      <p className="mt-3">
        Every order ships carbon-neutral and free over $99 in the US.
      </p>
    </StubPage>
  );
}
