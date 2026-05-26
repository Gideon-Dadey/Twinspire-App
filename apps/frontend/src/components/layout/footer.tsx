import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

import { NewsletterForm } from './newsletter-form';

import { footerNav, siteConfig } from '@/lib/site-config';

const groups: { title: string; items: ReadonlyArray<{ href: string; label: string }> }[] = [
  { title: 'Shop', items: footerNav.shop },
  { title: 'Customer service', items: footerNav.service },
  { title: 'Company', items: footerNav.company },
  { title: 'Legal', items: footerNav.legal },
];

const socials = [
  { href: siteConfig.links.twitter, label: 'Twitter', icon: Twitter },
  { href: siteConfig.links.instagram, label: 'Instagram', icon: Instagram },
  { href: siteConfig.links.facebook, label: 'Facebook', icon: Facebook },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 border-b border-secondary-foreground/10 pb-12 lg:grid-cols-[1fr,1.2fr] lg:items-center">
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Join the TwinSpire insider list.
            </h2>
            <p className="mt-2 text-sm text-secondary-foreground/70">
              Early access to launches, sale alerts, and our editor's reviews — straight to your
              inbox. No spam, ever.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-12 pt-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2" aria-label={siteConfig.name}>
              <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground shadow-sm"
              >
                T
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-secondary-foreground/70">
              {siteConfig.description}
            </p>
            <ul className="mt-6 flex items-center gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary-foreground/15 text-secondary-foreground/70 transition-colors hover:border-secondary-foreground/40 hover:text-secondary-foreground"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground/60">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-secondary-foreground/80 transition-colors hover:text-secondary-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto flex flex-col gap-2 px-4 py-6 text-xs text-secondary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            <Link href="/legal/privacy" className="underline-offset-2 hover:underline">
              Privacy
            </Link>{' '}
            ·{' '}
            <Link href="/legal/terms" className="underline-offset-2 hover:underline">
              Terms
            </Link>{' '}
            ·{' '}
            <Link href="/legal/accessibility" className="underline-offset-2 hover:underline">
              Accessibility
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
