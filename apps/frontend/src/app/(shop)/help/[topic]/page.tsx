import { Briefcase, Building2, Clock, Globe, Headphones, Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StubPage } from '@/components/shop/stub-page';

const TOPICS: Record<string, { title: string; description: string; body: string[] }> = {
  faq: {
    title: 'Frequently asked questions',
    description: 'Everything you might want to know about TwinSpire orders, returns, and accounts.',
    body: [
      'How long does delivery take? Greater Accra: same-day or next-day. Other regions: 2–4 working days. We confirm the timing on the call after payment.',
      'Do you offer warranties? Every TwinSpire purchase includes the full manufacturer warranty plus 90 days of accidental-damage protection on phones and laptops.',
      'Can I return a product? Yes — within 7 days of delivery for a full refund on unopened items. Opened electronics may have a small restocking fee.',
      'Do you deliver outside Ghana? No — we only deliver within Ghana. Diaspora customers can buy and put a Ghana phone in the delivery details.',
    ],
  },
  delivery: {
    title: 'Delivery in Ghana',
    description: 'How we get your order to you, anywhere in Ghana.',
    body: [
      'After you pay, our team calls you on the phone you provided to confirm the order and arrange delivery.',
      'Greater Accra: free same-day or next-day delivery via our dispatch riders.',
      'Other regions: 2–4 working days via our trusted logistics partners. Free across Ghana.',
      'Pickup at our Accra store is always available — just let the agent know on the call.',
    ],
  },
  payments: {
    title: 'Payment methods',
    description: 'Mobile money, cards, and PayPal — pay how you like.',
    body: [
      'Mobile money via Paystack: MTN MoMo, Vodafone Cash, AirtelTigo Money.',
      'Local & international cards: Visa, Mastercard, Verve (Paystack for local, Stripe for international).',
      'PayPal: for diaspora customers paying from abroad.',
      'All prices are in Ghana cedis (GHS). VAT (12.5%) is included in the displayed total.',
    ],
  },
  returns: {
    title: 'Returns & refunds',
    description: "7-day free returns on unopened items. Here's how it works.",
    body: [
      'Tell us within 7 days of delivery — by phone or email — and bring the item back to our Accra store, or arrange a pickup with our team.',
      'Refunds are issued to the original payment channel (MoMo wallet, card, or PayPal) within 3–5 working days of receiving the return.',
      'Defective items are eligible for a free replacement or full refund — your choice.',
    ],
  },
  warranty: {
    title: 'Warranty',
    description: 'Full manufacturer warranty plus our own accidental-damage cover.',
    body: [
      'Every TwinSpire purchase ships with the full manufacturer warranty (typically 12 months).',
      'On phones and laptops we add 90 days of accidental-damage protection on top — drops and liquid spills covered.',
      'Bring the device to our Accra store with proof of purchase to start a warranty claim. Most claims are resolved within 7 working days.',
    ],
  },
  contact: {
    title: 'Contact us',
    // `body` is intentionally empty — the contact page renders a custom rich
    // layout below instead of the default bulleted list. We keep the key so
    // the topic shape stays consistent for `generateStaticParams`.
    description:
      'Reach the Twinspire Ghana team for product enquiries, partnerships, or feedback — we welcome them all.',
    body: [],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Contact page — rich layout
//
// Lives in this file because it's the only topic that needs more than a flat
// list. If a second topic ever needs the same treatment, extract a shared
// `<HelpRichContent>` component.
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY_INFO: ReadonlyArray<{
  icon: typeof Phone;
  label: string;
  value: React.ReactNode;
}> = [
  { icon: Building2, label: 'Company Name', value: 'Twinspire Tech.' },
  { icon: MapPin, label: 'Head Office', value: 'Accra, Ghana' },
  {
    icon: Phone,
    label: 'Phone',
    value: (
      <a
        href="tel:+233550645804"
        className="text-foreground hover:text-primary font-medium transition-colors"
      >
        +233 550 645 804
      </a>
    ),
  },
  {
    icon: Mail,
    label: 'Email',
    value: (
      <a
        href="mailto:info@twinspiretech.com"
        className="text-foreground hover:text-primary font-medium transition-colors"
      >
        info@twinspiretech.com
      </a>
    ),
  },
  {
    icon: Globe,
    label: 'Website',
    value: (
      <a
        href="https://www.twinspiretech.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground hover:text-primary font-medium transition-colors"
      >
        www.twinspiretech.com
      </a>
    ),
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Monday – Sunday · 9:00 am – 6:00 pm (GMT)',
  },
];

const STORE_LOCATIONS: ReadonlyArray<{ name: string; address: string[] }> = [
  {
    name: 'Lashibi Branch',
    address: ['59 OSRAM AVE, GT-362-2834', 'Tema Metropolis, Greater Accra Region'],
  },
  {
    name: 'Achimota Branch',
    address: ['Boundary Road, near Melcom Plus', 'Accra'],
  },
];

function ContactPageContent() {
  return (
    <div className="not-prose text-foreground space-y-10">
      <p className="text-muted-foreground text-base leading-relaxed">
        Thank you for your interest in{' '}
        <span className="text-foreground font-semibold">Twinspire Ghana</span> — your trusted
        e-commerce platform for electronic products. We welcome your inquiries, partnerships, and
        feedback.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company information ------------------------------------------------ */}
        <section
          aria-labelledby="contact-company"
          className="border-border bg-background rounded-lg border p-6 shadow-sm"
        >
          <h2
            id="contact-company"
            className="text-foreground text-base font-semibold tracking-tight"
          >
            Company Information
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            {COMPANY_INFO.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-start gap-3">
                  <Icon className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                      {row.label}
                    </dt>
                    <dd className="text-foreground mt-0.5 break-words text-sm">{row.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </section>

        {/* Store locations --------------------------------------------------- */}
        <section
          aria-labelledby="contact-stores"
          className="border-border bg-background rounded-lg border p-6 shadow-sm"
        >
          <h2
            id="contact-stores"
            className="text-foreground text-base font-semibold tracking-tight"
          >
            Store Locations
          </h2>
          <ul className="mt-5 space-y-5 text-sm">
            {STORE_LOCATIONS.map((store) => (
              <li key={store.name} className="border-primary/70 border-l-2 pl-4">
                <p className="text-foreground text-sm font-semibold">{store.name}</p>
                <address className="text-muted-foreground mt-1 space-y-0.5 text-sm not-italic">
                  {store.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer service -------------------------------------------------- */}
        <section
          aria-labelledby="contact-cs"
          className="border-border bg-muted/30 rounded-lg border p-6"
        >
          <div className="flex items-center gap-2.5">
            <Headphones className="text-primary h-5 w-5" aria-hidden />
            <h2 id="contact-cs" className="text-foreground text-base font-semibold tracking-tight">
              Customer Service
            </h2>
          </div>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            For product inquiries, order tracking, or after-sales support, please contact our
            customer care team via phone or email. We&apos;ll be happy to assist you promptly.
          </p>
        </section>

        {/* Business cooperation ---------------------------------------------- */}
        <section
          aria-labelledby="contact-business"
          className="border-border bg-muted/30 rounded-lg border p-6"
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="text-primary h-5 w-5" aria-hidden />
            <h2
              id="contact-business"
              className="text-foreground text-base font-semibold tracking-tight"
            >
              Business Cooperation
            </h2>
          </div>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            For brand partnerships, wholesale purchases, or advertising opportunities, please email
            us at{' '}
            <a
              href="mailto:business@twinspire.com"
              className="text-foreground hover:text-primary font-medium underline-offset-2 transition-colors hover:underline"
            >
              business@twinspire.com
            </a>
            .
          </p>
        </section>
      </div>

      <p className="text-muted-foreground text-center text-sm italic">
        Twinspire — Technology Makes Life Easier.
      </p>
    </div>
  );
}

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
      {topic === 'contact' ? (
        <ContactPageContent />
      ) : (
        <ul className="space-y-4">
          {entry.body.map((paragraph) => (
            <li key={paragraph}>{paragraph}</li>
          ))}
        </ul>
      )}
    </StubPage>
  );
}
