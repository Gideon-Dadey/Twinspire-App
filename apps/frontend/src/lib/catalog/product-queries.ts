import type { Product } from '@twinspire/types';

export function filterPublishedProducts(products: Product[]): Product[] {
  return products.filter((p) => p.status === 'published' && !p.deletedAt);
}

export function findProductBySlug(products: Product[], slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function findProductById(products: Product[], id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(products: Product[], categoryId: string): Product[] {
  return products.filter((p) => p.categoryIds.includes(categoryId));
}

export function getRelatedProducts(products: Product[], productId: string, limit = 4): Product[] {
  const product = findProductById(products, productId);
  if (!product) return [];
  const sameBrand = products.filter((p) => p.id !== productId && p.brandId === product.brandId);
  const sameCategory = products.filter(
    (p) =>
      p.id !== productId &&
      p.brandId !== product.brandId &&
      p.categoryIds.some((id) => product.categoryIds.includes(id)),
  );
  return [...sameBrand, ...sameCategory].slice(0, limit);
}

export function getFeaturedProducts(products: Product[], limit = 6): Product[] {
  return products.filter((p) => p.isFeatured).slice(0, limit);
}

export function getBestSellers(products: Product[], limit = 8): Product[] {
  return products.filter((p) => p.isBestSeller).slice(0, limit);
}

export function getNewArrivals(products: Product[], limit = 8): Product[] {
  return products
    .filter((p) => p.isNewArrival)
    .sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''))
    .slice(0, limit);
}

export function getDeals(products: Product[], limit = 12): Product[] {
  return products
    .filter((p) => p.price.compareAtAmount && p.price.compareAtAmount > p.price.amount)
    .sort((a, b) => (b.price.discountPercent ?? 0) - (a.price.discountPercent ?? 0))
    .slice(0, limit);
}
