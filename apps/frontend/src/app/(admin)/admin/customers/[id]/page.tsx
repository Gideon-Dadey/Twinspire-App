'use client';

import { use } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CustomerDetail } from '@/components/admin/customer-detail';
import { useAdminCustomer } from '@/lib/hooks/use-admin';

export default function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerQuery = useAdminCustomer(id);
  const fullName = customerQuery.data
    ? `${customerQuery.data.customer.firstName} ${customerQuery.data.customer.lastName}`
    : undefined;

  return (
    <>
      <AdminPageHeader
        title={fullName ?? 'Customer'}
        description="Activity, orders, and account controls."
        breadcrumb={[
          { label: 'Customers', href: '/admin/customers' },
          { label: fullName ?? 'Detail' },
        ]}
      />
      <CustomerDetail customerId={id} />
    </>
  );
}
