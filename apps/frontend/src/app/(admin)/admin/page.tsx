import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DashboardOverview } from '@/components/admin/dashboard-overview';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function AdminDashboardPage() {
  const today = new Date();
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Real-time overview for ${today.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}.`}
      />
      <DashboardOverview />
    </>
  );
}
