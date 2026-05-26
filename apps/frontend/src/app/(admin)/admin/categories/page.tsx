import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CategoriesPageContent } from '@/components/admin/categories-page-content';

export const metadata: Metadata = {
  title: 'Categories',
};

export default function AdminCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Organize the catalog into discoverable groups. Categories drive navigation, search, and merchandising rules."
        breadcrumb={[{ label: 'Categories' }]}
      />
      <CategoriesPageContent />
    </>
  );
}
