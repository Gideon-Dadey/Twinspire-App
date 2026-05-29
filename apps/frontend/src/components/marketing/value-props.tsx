import { Reveal, Stagger, StaggerItem } from '@twinspire/ui';
import Image from 'next/image';
import Link from 'next/link';

interface ValueProp {
  image: string;
  alt: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}

const items: ValueProp[] = [
  {
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&h=600&q=80',
    alt: 'Shop assistant helping a customer at an in-store checkout counter',
    title: 'In-store stock in Ghana',
    body: 'Every product is on the shelf in our Accra store — no overseas wait, no customs surprises.',
    cta: { label: 'Find our stores', href: '/stores' },
  },
  {
    image:
      'https://images.unsplash.com/photo-1771587529573-7f514f51f2a4?auto=format&fit=crop&w=800&h=600&q=80',
    alt: 'Customer paying with a smartphone and credit card at checkout',
    title: 'Mobile money & card',
    body: 'Pay with MTN, Vodafone or AirtelTigo MoMo via Paystack, plus Visa, Mastercard, and PayPal.',
    cta: { label: 'Payment methods', href: '/help/payments' },
  },
  {
    image:
      'https://images.unsplash.com/photo-1771848194068-169d817a1d6f?auto=format&fit=crop&w=800&h=600&q=80',
    alt: 'Cardboard shipping box ready to be returned or sent back',
    title: '7-day returns',
    body: 'Change of mind? Return any unopened item within 7 days for a full refund.',
    cta: { label: 'Return policy', href: '/help/returns' },
  },
  {
    image:
      'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&h=600&q=80',
    alt: 'Customer speaking on the phone during a support call',
    title: 'We call you back',
    body: 'After payment our team calls to confirm details and arrange delivery anywhere in Ghana.',
    cta: { label: 'Contact us', href: '/help/contact' },
  },
];

export function ValueProps() {
  return (
    <section className="border-border bg-muted/30 border-y">
      <div className="container mx-auto px-3 py-10 sm:px-4 sm:py-14 md:py-16">
        <Reveal>
          <header className="mb-8 max-w-2xl">
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
              Why TwinSpire
            </p>
            <h2 className="type-section-heading text-foreground mt-2">
              Service that lives up to the hardware.
            </h2>
          </header>
        </Reveal>

        <Stagger
          className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-0 lg:gap-y-0"
          stagger={0.06}
        >
          {items.map(({ image, alt, title, body, cta }, idx) => (
            <StaggerItem key={title} className="w-full min-w-0">
              <article
                className={
                  'group relative flex h-full w-full min-w-0 flex-col gap-4 lg:px-6 ' +
                  (idx > 0 ? 'lg:border-border lg:border-l' : '') +
                  (idx === 0 ? ' lg:pl-0' : '')
                }
              >
                <div className="border-border w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                  <Image
                    src={image}
                    alt={alt}
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

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
