import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductForm } from '@/components/admin/product-form';

export const metadata: Metadata = {
  title: 'New product',
};

export default function AdminNewProductPage() {
  return (
    <>
      <AdminPageHeader
        title="New product"
        description="Create a new listing. You can save as a draft and publish later."
        breadcrumb={[{ label: 'Products', href: '/admin/products' }, { label: 'New' }]}
      />
      <ProductForm mode="create" />
    </>
  );
}
