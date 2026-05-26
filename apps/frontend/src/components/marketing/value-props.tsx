import { Reveal, Stagger, StaggerItem } from '@twinspire/ui';
import { HeadphonesIcon, RotateCcw, Smartphone, Store, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ValueProp {
  icon: LucideIcon;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

const items: ValueProp[] = [
  {
    icon: Store,
    title: 'In-store stock in Ghana',
    body: 'Every product is on the shelf in our Accra store — no overseas wait, no customs surprises.',
    cta: { label: 'Find our stores', href: '/stores' },
  },
  {
    icon: Smartphone,
    title: 'Mobile money & card',
    body: 'Pay with MTN, Vodafone or AirtelTigo MoMo via Paystack, plus Visa, Mastercard, and PayPal.',
    cta: { label: 'Payment methods', href: '/help/payments' },
  },
  {
    icon: RotateCcw,
    title: '7-day returns',
    body: 'Change of mind? Return any unopened item within 7 days for a full refund.',
    cta: { label: 'Return policy', href: '/help/returns' },
  },
  {
    icon: HeadphonesIcon,
    title: 'We call you back',
    body: 'After payment our team calls to confirm details and arrange delivery anywhere in Ghana.',
    cta: { label: 'Contact us', href: '/help/contact' },
  },
];

export function ValueProps() {
  return (
    <section className="border-border bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <Reveal>
          <header className="mb-8 max-w-2xl">
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
              Why TwinSpire
            </p>
            <h2 className="font-display text-foreground mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Service that lives up to the hardware.
            </h2>
          </header>
        </Reveal>

        <Stagger
          className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0"
          stagger={0.06}
        >
          {items.map(({ icon: Icon, title, body, cta }, idx) => (
            <StaggerItem key={title}>
              <article
                className={
                  'group relative flex h-full flex-col gap-3 lg:px-6 ' +
                  // Subtle vertical dividers between the four items on lg+ —
                  // standard pattern on premium SaaS trust bars.
                  (idx > 0 ? 'lg:border-border lg:border-l' : '') +
                  (idx === 0 ? ' lg:pl-0' : '')
                }
              >
                <span
                  className="border-primary/15 bg-primary/10 text-primary duration-moderate group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground inline-flex size-11 items-center justify-center rounded-lg border transition-colors"
                  aria-hidden
                >
                  <Icon className="size-5" />
                </span>

                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-foreground text-[15px] font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </div>

                {cta && (
                  <Link
                    href={cta.href}
                    className="text-primary/90 hover:text-primary inline-flex w-fit items-center gap-1 text-xs font-medium transition-colors"
                  >
                    {cta.label}
                    <span
                      aria-hidden
                      className="duration-fast transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                )}
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
