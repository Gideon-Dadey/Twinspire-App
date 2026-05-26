import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StubPage } from '@/components/shop/stub-page';

const DOCS: Record<string, { title: string; description: string; updated: string; body: string[] }> = {
  privacy: {
    title: 'Privacy policy',
    description: 'How TwinSpire handles your data.',
    updated: '2026-01-15',
    body: [
      'We collect the minimum data required to fulfill orders and provide our service: account email, shipping address, payment metadata, and behavioral analytics on TwinSpire-owned properties.',
      'We never sell your data. Third parties receive only the data required to perform their service (e.g. carriers receive shipping addresses).',
      'You can export or delete your data at any time from your account settings.',
    ],
  },
  terms: {
    title: 'Terms of service',
    description: 'The rules of using TwinSpire.',
    updated: '2026-01-15',
    body: [
      'By using TwinSpire you agree to these terms. We can change them — we will email registered users 30 days before any material change.',
      'Orders are subject to availability and may be cancelled if pricing errors are detected.',
      'You retain ownership of any content you upload (reviews, photos). You grant us a license to display it within the TwinSpire service.',
    ],
  },
  cookies: {
    title: 'Cookie policy',
    description: 'How we use cookies and similar technologies.',
    updated: '2026-01-15',
    body: [
      'Essential cookies keep your cart, session, and security features working. They cannot be disabled.',
      'Analytics cookies (opt-in) measure aggregate usage so we can improve the site. We use first-party analytics — no advertising trackers.',
      'You can opt out of analytics at any time from your account preferences or the cookie banner.',
    ],
  },
  accessibility: {
    title: 'Accessibility statement',
    description: 'TwinSpire is committed to WCAG 2.1 AA compliance.',
    updated: '2026-01-15',
    body: [
      'Our design system is built on accessible Radix UI primitives, audited with axe-core, and tested with screen readers (NVDA, VoiceOver).',
      'Every interactive element has a 44x44 minimum target size on mobile, ARIA semantics, and a visible keyboard focus state.',
      'If you encounter an accessibility issue, email accessibility@twinspire.com — we aim to fix critical issues within 5 business days.',
    ],
  },
};

interface PageProps {
  params: Promise<{ doc: string }>;
}

export async function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { doc } = await params;
  const entry = DOCS[doc];
  if (!entry) return { title: 'Legal' };
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/legal/${doc}` },
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { doc } = await params;
  const entry = DOCS[doc];
  if (!entry) notFound();

  return (
    <StubPage
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Legal', href: '/legal/privacy' },
        { label: entry.title },
      ]}
      eyebrow={`Last updated: ${entry.updated}`}
      title={entry.title}
      description={entry.description}
    >
      <ol className="ml-5 list-decimal space-y-3">
        {entry.body.map((paragraph) => (
          <li key={paragraph}>{paragraph}</li>
        ))}
      </ol>
    </StubPage>
  );
}
