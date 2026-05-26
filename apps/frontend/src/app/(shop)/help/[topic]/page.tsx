import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StubPage } from '@/components/shop/stub-page';

const TOPICS: Record<string, { title: string; description: string; body: string[] }> = {
  faq: {
    title: 'Frequently asked questions',
    description: 'Everything you might want to know about TwinSpire orders, returns, and accounts.',
    body: [
      'How long does shipping take? Standard ships in 2–3 business days. Express the next business day. Overnight ships same day if ordered before 12pm ET.',
      'Do you offer warranties? Every TwinSpire purchase includes a 2-year warranty, plus accidental-damage protection free of charge.',
      'Can I return a product? Yes — within 30 days of delivery, free of charge. Refurbished and open-box items have a 14-day money-back window.',
      'Do you ship internationally? Yes, to 60+ countries via DHL Express. Final pricing is shown at checkout.',
    ],
  },
  shipping: {
    title: 'Shipping & delivery',
    description: 'Carriers, methods, and timing for every TwinSpire region.',
    body: [
      'US domestic orders ship via FedEx (small parcels) and FedEx Freight (TVs and large items).',
      'International orders ship via DHL Express with full tracking and delivered duty paid in most countries.',
      'Free shipping on US orders over $99. Carbon-neutral on every order.',
    ],
  },
  returns: {
    title: 'Returns & refunds',
    description: '30-day free returns on every order. Here\'s how it works.',
    body: [
      'Start a return from your order history. You will receive a pre-paid shipping label.',
      'Most refunds appear on your original payment method within 3–5 business days of us receiving the return.',
      'Defective items are eligible for free replacement or full refund — your choice.',
    ],
  },
  warranty: {
    title: 'Warranty',
    description: '2 years of free coverage, plus accidental-damage protection.',
    body: [
      'Every TwinSpire purchase ships with a 2-year warranty against manufacturing defects.',
      'Accidental-damage protection covers drops and liquid spills for the first 12 months.',
      'Manufacturer warranties apply in addition — we never void them.',
    ],
  },
  contact: {
    title: 'Contact us',
    description: 'We staff 24/7 — chat, email, or phone.',
    body: [
      'Chat: 24/7 via the chat icon in the bottom right.',
      'Email: support@twinspire.com — most responses within 2 hours.',
      'Phone: +1 (800) 555-0188 — Mon–Sun, 6am to midnight ET.',
    ],
  },
};

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const entry = TOPICS[topic];
  if (!entry) return { title: 'Help' };
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/help/${topic}` },
  };
}

export default async function HelpTopicPage({ params }: PageProps) {
  const { topic } = await params;
  const entry = TOPICS[topic];
  if (!entry) notFound();

  return (
    <StubPage
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Help', href: '/help/faq' },
        { label: entry.title },
      ]}
      eyebrow="Help"
      title={entry.title}
      description={entry.description}
    >
      <ul className="space-y-4">
        {entry.body.map((paragraph) => (
          <li key={paragraph}>{paragraph}</li>
        ))}
      </ul>
    </StubPage>
  );
}
