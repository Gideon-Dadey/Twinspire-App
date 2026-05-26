import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CustomersList } from '@/components/admin/customers-list';

export const metadata: Metadata = {
  title: 'Customers',
};

export default function AdminCustomersPage() {
  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Search, view lifetime value, and update account status. Role changes require admin access."
        breadcrumb={[{ label: 'Customers' }]}
      />
      <CustomersList />
    </>
  );
}
