import type { Metadata } from 'next';

import { OrderDetail } from '@/components/account/order-detail';

export const metadata: Metadata = {
  title: 'Order details',
  description: 'View an order from your TwinSpire account.',
  robots: { index: false, follow: false },
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
