import type { Metadata } from 'next';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { OrdersList } from '@/components/account/orders-list';

export const metadata: Metadata = {
  title: 'Your orders',
  description: 'Track shipments and review past orders.',
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Orders"
        description="Track shipments, download invoices, and reorder anything you loved."
      />
      <OrdersList />
    </div>
  );
}
