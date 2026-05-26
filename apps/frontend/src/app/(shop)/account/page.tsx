import type { Metadata } from 'next';

import { AccountQuickLinks } from '@/components/account/account-quick-links';
import { DashboardGreeting } from '@/components/account/dashboard-greeting';
import { DashboardStats } from '@/components/account/dashboard-stats';
import { RecentOrdersCard } from '@/components/account/recent-orders-card';

export const metadata: Metadata = {
  title: 'Your account',
  description: 'Manage orders, wishlist, addresses, and security.',
  robots: { index: false, follow: false },
};

export default function AccountDashboardPage() {
  return (
    <div className="space-y-10">
      <DashboardGreeting />
      <DashboardStats />
      <RecentOrdersCard />
      <AccountQuickLinks />
    </div>
  );
}
