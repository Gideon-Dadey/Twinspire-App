import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/shared/json-ld';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { ProductBuyBox } from '@/components/shop/pdp/product-buy-box';
import { ProductGallery } from '@/components/shop/pdp/product-gallery';
import { ProductReviews } from '@/components/shop/pdp/product-reviews';
import { ProductSpecs } from '@/components/shop/pdp/product-specs';
import { RelatedProducts } from '@/components/shop/pdp/related-products';
import { getCategoryById } from '@/data/categories';
import { getProductBySlug, getRelatedProducts, products as ALL_PRODUCTS } from '@/data/products';
import { getReviewsByProductId } from '@/data/reviews';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/helpers/json-ld';
import { siteConfig } from '@/lib/site-config';
import { Breadcrumb, Tabs, TabsContent, TabsList, TabsTrigger } from '@twinspire/ui';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: `${product.name} — ${product.brandName ?? siteConfig.name}`,
    description: product.shortDescription ?? product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const reviews = getReviewsByProductId(product.id);
  const related = getRelatedProducts(product.id, 4);
  const primaryCategory = getCategoryById(product.primaryCategoryId);
  const rootCategory = primaryCategory?.parentId
    ? getCategoryById(primaryCategory.parentId)
    : primaryCategory;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    rootCategory ? { label: rootCategory.name, href: `/${rootCategory.slug}` } : undefined,
    primaryCategory && primaryCategory.id !== rootCategory?.id
      ? { label: primaryCategory.name, href: `/${primaryCategory.slug}` }
      : undefined,
    { label: product.name },
  ].filter((item): item is { label: string; href?: string } => Boolean(item));

  return (
    <>
      <JsonLd data={productJsonLd(product, reviews)} />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbItems.map((item) => ({ name: item.label, url: item.href })),
        )}
      />

      <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
        <Breadcrumb items={breadcrumbItems} linkComponent={NextLinkBreadcrumb} className="mb-6" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductBuyBox product={product} />
        </div>

        <div className="mt-16">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start gap-1 overflow-x-auto md:w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews <span className="ml-1.5 text-xs opacity-70">{reviews.length}</span>
              </TabsTrigger>
              <TabsTrigger value="shipping">Shipping &amp; returns</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="prose-tight max-w-3xl">
              <h2 className="font-display text-xl font-bold tracking-tight">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              {product.attributes.length > 0 && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {product.attributes.map((attr) => (
                    <div
                      key={attr.attributeId}
                      className="rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <p className="text-xs text-muted-foreground">{attr.name}</p>
                      <p className="font-medium text-foreground">{String(attr.value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="specs">
              <ProductSpecs specifications={product.specifications} />
            </TabsContent>

            <TabsContent value="reviews">
              <ProductReviews rating={product.rating} reviews={reviews} />
            </TabsContent>

            <TabsContent value="shipping" className="max-w-3xl space-y-4 text-sm text-muted-foreground">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Shipping &amp; returns
              </h2>
              <p>
                Orders ship within 1 business day from our US warehouse. Free 2-day shipping on orders
                over $99 — express overnight is available for $19 at checkout.
              </p>
              <p>
                Returns are free within 30 days of delivery. Refurbished and open-box items are
                covered by a 14-day money-back guarantee. Defective items are replaced under the
                manufacturer's warranty.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-20">
          <RelatedProducts items={related} />
        </div>
      </div>
    </>
  );
}
