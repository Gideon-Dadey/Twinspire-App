import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { siteConfig } from '@/lib/site-config';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    // Centered single-column auth shell. The previous two-column layout with a
    // marketing aside was removed per design — the logo carries the brand and
    // the form stays the focal point at every viewport.
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-6">
        <Link href="/" aria-label={siteConfig.name} className="inline-flex items-center">
          <Image
            src="/twinspire-logo.png"
            alt={siteConfig.name}
            width={1280}
            height={426}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>
        <Link
          href="/help/contact"
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          Need help?
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">{children}</main>

      <footer className="text-muted-foreground flex flex-col items-center justify-between gap-2 p-6 text-xs sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
        <nav className="flex gap-4">
          <Link href="/legal/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/help/contact" className="hover:text-foreground transition-colors">
            Help
          </Link>
        </nav>
      </footer>
    </div>
  );
}
