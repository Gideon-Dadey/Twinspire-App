import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CouponsPageContent } from '@/components/admin/coupons-page-content';

export const metadata: Metadata = {
  title: 'Coupons',
};

export default function AdminCouponsPage() {
  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Create discount codes, control redemption limits, and monitor usage."
        breadcrumb={[{ label: 'Coupons' }]}
      />
      <CouponsPageContent />
    </>
  );
}
