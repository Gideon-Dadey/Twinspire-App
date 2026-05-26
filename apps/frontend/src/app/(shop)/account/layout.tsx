import { Breadcrumb } from '@twinspire/ui';
import type { ReactNode } from 'react';

import { AccountSidebar } from '@/components/account/account-sidebar';
import { AuthGuard } from '@/components/account/auth-guard';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Breadcrumb
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Account' },
          ]}
          linkComponent={NextLinkBreadcrumb}
        />
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <AccountSidebar />
          <div className="min-w-0 space-y-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
