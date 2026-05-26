import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@twinspire/ui';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductGrid } from '@/components/shop/product-grid';
import { brands, getBrandBySlug } from '@/data/brands';
import { products } from '@/data/products';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: 'Brand not found' };
  return {
    title: `${brand.name} — TwinSpire`,
    description: brand.description ?? `Shop ${brand.name} on TwinSpire — authentic with full warranty.`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const items = products.filter((p) => p.brandId === brand.id);

  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
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
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {brand.name}
        </h1>
        {brand.description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{brand.description}</p>
        )}
      </header>

      <ProductGrid items={items} />
    </div>
  );
}
