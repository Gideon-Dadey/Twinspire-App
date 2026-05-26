import type { BlogPost, Product, Review } from '@twinspire/types';

import { siteConfig } from '@/lib/site-config';

function abs(path: string): string {
  return path.startsWith('http') ? path : `${siteConfig.url}${path}`;
}

export function productJsonLd(product: Product, reviews: Review[] = []): Record<string, unknown> {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description,
    sku: product.sku,
    brand: product.brandName ? { '@type': 'Brand', name: product.brandName } : undefined,
    image: product.images.map((img) => img.url),
    offers: {
      '@type': 'Offer',
      url: abs(`/products/${product.slug}`),
      priceCurrency: product.price.currency,
      price: product.price.amount,
      availability:
        product.stockStatus === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : product.stockStatus === 'preorder'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/InStock',
      itemCondition:
        product.condition === 'refurbished'
          ? 'https://schema.org/RefurbishedCondition'
          : product.condition === 'used'
            ? 'https://schema.org/UsedCondition'
            : 'https://schema.org/NewCondition',
    },
    aggregateRating:
      product.rating && product.rating.count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.authorName ?? 'Anonymous' },
      datePublished: review.createdAt,
      reviewBody: review.body,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url ? abs(item.url) : undefined,
    })),
  };
}

export function blogPostingJsonLd(post: BlogPost, authorName: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage?.url,
    author: { '@type': 'Person', name: authorName },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(`/blog/${post.slug}`) },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: abs('/favicon.svg') },
    },
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: abs('/favicon.svg'),
    sameAs: [siteConfig.links.twitter, siteConfig.links.instagram, siteConfig.links.facebook],
  };
}
