import { Button } from '@twinspire/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductsList } from '@/components/admin/products-list';

export const metadata: Metadata = {
  title: 'Products',
};

export default function AdminProductsPage() {
  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Manage the storefront catalog: pricing, inventory, status, and metadata."
        breadcrumb={[{ label: 'Products' }]}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="size-4" aria-hidden /> New product
            </Link>
          </Button>
        }
      />
      <Suspense fallback={null}>
        <ProductsList />
      </Suspense>
    </>
  );
}
