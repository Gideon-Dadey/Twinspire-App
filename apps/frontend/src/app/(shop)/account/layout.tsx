import { Breadcrumb } from '@twinspire/ui';
import type { ReactNode } from 'react';

import { AccountMobileNav } from '@/components/account/account-mobile-nav';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { AuthGuard } from '@/components/account/auth-guard';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-10">
        <Breadcrumb
          className="mb-6"
          items={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
          linkComponent={NextLinkBreadcrumb}
        />

        {/* Mobile/tablet: compact identity row + horizontal nav pills.
            Hides automatically at lg+ where the full sidebar takes over. */}
        <AccountMobileNav />

        <div className="mt-6 grid gap-6 lg:mt-0 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          {/* Desktop sidebar — hidden on mobile to keep the user's first
              touch point in reach. Mobile users navigate via the pill row
              above instead. */}
          <div className="hidden lg:block">
            <AccountSidebar />
          </div>
          <div className="min-w-0 space-y-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
