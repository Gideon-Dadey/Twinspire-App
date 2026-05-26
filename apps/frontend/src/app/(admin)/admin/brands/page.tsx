import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { BrandsPageContent } from '@/components/admin/brands-page-content';

export const metadata: Metadata = {
  title: 'Brands',
};

export default function AdminBrandsPage() {
  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Manage manufacturer profiles, logos, and merchandising flags."
        breadcrumb={[{ label: 'Brands' }]}
      />
      <BrandsPageContent />
    </>
  );
}
