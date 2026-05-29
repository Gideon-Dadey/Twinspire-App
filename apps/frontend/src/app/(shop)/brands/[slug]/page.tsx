import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import {
  getBrandBySlug,
  getStorefrontBrands,
  getStorefrontProducts,
} from '@/lib/catalog/catalog-service';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const brands = await getStorefrontBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: 'Brand not found' };
  return {
    title: `${brand.name} — TwinSpire`,
    description:
      brand.description ?? `Shop ${brand.name} on TwinSpire — authentic with full warranty.`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const products = await getStorefrontProducts();
  const items = products.filter((p) => p.brandId === brand.id);

  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Brands', href: '/brands' },
          { label: brand.name },
        ]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />
      <header className="mb-10">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          {brand.name}
        </h1>
        {brand.description && (
          <p className="text-muted-foreground mt-3 max-w-2xl">{brand.description}</p>
        )}
      </header>

      <ProductGrid items={items} emptyTitle={`No ${brand.name} products right now`} />
    </div>
  );
}
