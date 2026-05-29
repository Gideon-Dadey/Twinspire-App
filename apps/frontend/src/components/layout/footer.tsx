import { Clock, Facebook, Instagram, MapPin, Phone, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { siteConfig } from '@/lib/site-config';

const PRIMARY_PHONE = '+233 550645804';
const PRIMARY_PHONE_HREF = 'tel:+233550645804';
const ADDRESS_LINE_1 = '59 OSRAM AVE, GT-362-2834,';
const ADDRESS_LINE_2 = 'Tema Metropolis, Greater Accra Region';

const quickLinks = [
  { href: '/about', label: 'Company' },
  { href: '/help/faq', label: "How it's Work" },
  { href: '/products', label: 'Service' },
  { href: '/blog', label: 'Case Studies' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
] as const;

const supportLinks = [
  { href: '/help/faq', label: 'Help Centre' },
  { href: '/account/orders', label: 'Track Order' },
  { href: '/help/returns', label: 'Returns & Refunds' },
  { href: '/help/warranty', label: 'Warranty' },
  { href: '/help/contact', label: 'Contact' },
] as const;

const openingHours = [{ label: 'Monday – Friday', value: '9:00 am – 10:00 pm' }] as const;

const socials = [
  { href: siteConfig.links.twitter, label: 'Twitter', icon: Twitter },
  { href: siteConfig.links.instagram, label: 'Instagram', icon: Instagram },
  { href: siteConfig.links.facebook, label: 'Facebook', icon: Facebook },
] as const;

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-foreground text-xs font-semibold uppercase tracking-[0.14em]">
      {children}
    </h3>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-border bg-background text-foreground border-t">
      <div className="container mx-auto px-3 py-16 sm:px-4">
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,20rem)_auto_auto_minmax(0,17rem)] lg:items-start lg:gap-x-8 lg:gap-y-10 xl:gap-x-10">
          {/* ── Brand column ─────────────────────────────────────────── */}
          <div className="md:col-span-2 lg:col-span-1 lg:max-w-[20rem]">
            <Link href="/" className="inline-flex items-center" aria-label={siteConfig.name}>
              <Image
                src="/twinspire-logo.png"
                alt={siteConfig.name}
                width={1280}
                height={426}
                className="h-10 w-auto"
                priority={false}
              />
            </Link>

            <p className="text-muted-foreground mt-5 max-w-[20rem] text-balance text-sm leading-relaxed">
              We work with a passion of taking challenges
              <br className="hidden sm:inline" /> and creating new ones in advertising sector.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <a
                  href={PRIMARY_PHONE_HREF}
                  className="text-foreground hover:text-primary font-medium transition-colors"
                >
                  {PRIMARY_PHONE}
                </a>
              </li>
            </ul>

            <ul className="mt-7 flex items-center gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={label}
                    className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick Links ─────────────────────────────────────────── */}
          <nav aria-labelledby="footer-quick-links">
            <ColumnHeading>
              <span id="footer-quick-links">Quick Links</span>
            </ColumnHeading>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Support ────────────────────────────────────────────── */}
          <nav aria-labelledby="footer-support">
            <ColumnHeading>
              <span id="footer-support">Support</span>
            </ColumnHeading>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Official Info ──────────────────────────────────────── */}
          <div className="md:col-span-2 lg:col-span-1 lg:max-w-[17rem]">
            <ColumnHeading>Official Info</ColumnHeading>
            <div className="mt-5 space-y-3 text-sm">
              <address className="space-y-3 not-italic">
                <div className="text-muted-foreground flex items-start gap-3">
                  <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 leading-relaxed">
                    {ADDRESS_LINE_1}
                    <br />
                    {ADDRESS_LINE_2}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <a
                    href={PRIMARY_PHONE_HREF}
                    className="text-muted-foreground hover:text-foreground min-w-0 transition-colors"
                  >
                    {PRIMARY_PHONE}
                  </a>
                </div>
              </address>

              <div
                className="border-border flex items-start gap-3 border-t pt-3"
                aria-label="Opening hours"
              >
                <Clock className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <dl className="min-w-0 flex-1 space-y-2.5">
                  {openingHours.map((row) => {
                    const closed = row.value.toLowerCase() === 'closed';
                    return (
                      <div key={row.label}>
                        <dt className="text-foreground font-medium leading-snug">{row.label}</dt>
                        <dd
                          className={
                            closed
                              ? 'text-muted-foreground/80 mt-0.5 italic leading-snug'
                              : 'text-muted-foreground mt-0.5 leading-snug'
                          }
                        >
                          {row.value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal bar ─────────────────────────────────────────────── */}
      <div className="border-border bg-muted/30 border-t">
        <div className="text-muted-foreground container mx-auto flex flex-col gap-2 px-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <Link
              href="/legal/privacy"
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              Privacy
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/legal/terms"
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              Terms
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/legal/accessibility"
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              Accessibility
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
