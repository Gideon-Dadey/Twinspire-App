import { CreditCard, HeadphonesIcon, PackageCheck, RotateCcw } from 'lucide-react';

const items = [
  {
    icon: PackageCheck,
    title: 'Free 2-day shipping',
    body: 'On orders over $50. Same-day delivery in 30 metro areas.',
  },
  {
    icon: RotateCcw,
    title: '30-day returns',
    body: 'Change of mind? Return any unopened item for a full refund.',
  },
  {
    icon: CreditCard,
    title: 'Flexible payments',
    body: '0% APR installments via Affirm, Klarna, and Apple Pay Later.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Real human support',
    body: '24/7 chat with certified product specialists — no bots.',
  },
];

export function ValueProps() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-background shadow-sm">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
