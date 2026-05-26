import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export const metadata: Metadata = {
  title: { default: 'Admin · TwinSpire', template: '%s · TwinSpire Admin' },
  description: 'TwinSpire staff console',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="grid min-h-screen bg-muted/40 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden lg:flex">
          <AdminSidebar />
        </div>
        <div className="flex min-w-0 flex-col">
          <AdminTopbar />
          <main id="admin-main" className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
