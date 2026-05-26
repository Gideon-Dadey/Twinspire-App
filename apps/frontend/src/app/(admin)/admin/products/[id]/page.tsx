'use client';

import { Skeleton } from '@twinspire/ui';
import { use } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ProductForm } from '@/components/admin/product-form';
import { useAdminProduct } from '@/lib/hooks/use-admin';

export default function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productQuery = useAdminProduct(id);

  return (
    <>
      <AdminPageHeader
        title={productQuery.data?.product.name ?? 'Edit product'}
        description="Update pricing, status, inventory, and storefront badges."
        breadcrumb={[
          { label: 'Products', href: '/admin/products' },
          { label: productQuery.data?.product.name ?? 'Edit' },
        ]}
      />
      {productQuery.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : productQuery.data?.product ? (
        <ProductForm mode="edit" product={productQuery.data.product} />
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Product not found.
        </div>
      )}
    </>
  );
}
