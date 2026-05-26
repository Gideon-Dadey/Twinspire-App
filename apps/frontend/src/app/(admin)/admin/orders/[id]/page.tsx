'use client';

import { use } from 'react';

import { AdminOrderDetail } from '@/components/admin/order-detail';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { useAdminOrder } from '@/lib/hooks/use-admin';

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderQuery = useAdminOrder(id);
  const orderNumber = orderQuery.data?.order.orderNumber;

  return (
    <>
      <AdminPageHeader
        title={orderNumber ?? 'Order'}
        description="Fulfilment, refunds, and customer history."
        breadcrumb={[
          { label: 'Orders', href: '/admin/orders' },
          { label: orderNumber ?? 'Detail' },
        ]}
      />
      <AdminOrderDetail orderId={id} />
    </>
  );
}
