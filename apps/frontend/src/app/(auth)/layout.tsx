import Link from 'next/link';
import type { ReactNode } from 'react';

import { siteConfig } from '@/lib/site-config';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <main className="flex flex-col bg-background">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="text-sm font-semibold">
            {siteConfig.name}
          </Link>
          <Link href="/help/contact" className="text-xs text-muted-foreground hover:text-foreground">
            Need help?
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">{children}</div>
        <footer className="flex items-center justify-between gap-2 p-6 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TwinSpire</p>
          <nav className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/help/contact" className="hover:text-foreground">Help</Link>
          </nav>
        </footer>
      </main>

      <aside className="relative hidden overflow-hidden bg-gradient-hero text-primary-foreground lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary-300/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
          <Link href="/" className="text-lg font-display font-semibold tracking-tight text-primary-foreground">
            {siteConfig.name}
          </Link>
          <div className="space-y-6">
            <p className="text-2xl font-display font-medium leading-snug tracking-tight">
              &ldquo;The dashboard, order history, and 2FA flow are exactly what we needed to move
              off our legacy storefront. Customers love it.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              <p className="font-semibold">Adaeze Nwosu</p>
              <p>Director of Customer Experience, Nimbus Technologies</p>
            </footer>
          </div>
          <dl className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="opacity-70">Storefront</dt>
              <dd className="text-base font-semibold">99.99% uptime</dd>
            </div>
            <div>
              <dt className="opacity-70">Average response</dt>
              <dd className="text-base font-semibold">220 ms</dd>
            </div>
            <div>
              <dt className="opacity-70">Customer NPS</dt>
              <dd className="text-base font-semibold">+72</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
