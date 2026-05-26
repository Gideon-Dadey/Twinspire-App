import { ArrowRight, Heart, MapPin, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const LINKS = [
  {
    href: '/account/orders',
    label: 'Track an order',
    description: 'See where your recent shipments are right now.',
    icon: Package,
  },
  {
    href: '/account/addresses',
    label: 'Saved addresses',
    description: 'Add or update shipping & billing destinations.',
    icon: MapPin,
  },
  {
    href: '/account/wishlist',
    label: 'Your wishlist',
    description: 'Pick up where you left off shopping.',
    icon: Heart,
  },
  {
    href: '/account/security',
    label: 'Security center',
    description: 'Enable 2FA and review your sessions.',
    icon: ShieldCheck,
  },
];

export function AccountQuickLinks() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <span aria-hidden className="rounded-lg bg-primary/10 p-3 text-primary">
              <Icon className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        );
      })}
    </section>
  );
}
