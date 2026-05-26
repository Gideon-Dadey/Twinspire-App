import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OrdersList } from '@/components/admin/orders-list';

export const metadata: Metadata = {
  title: 'Orders',
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Search, filter, fulfil, and refund orders across all channels."
        breadcrumb={[{ label: 'Orders' }]}
      />
      <Suspense fallback={null}>
        <OrdersList />
      </Suspense>
    </>
  );
}
