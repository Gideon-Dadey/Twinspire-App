import type { Brand, Category, Product } from '@twinspire/types';

import { env } from '@/env';

import {
  filterPublishedProducts,
  findProductById,
  findProductBySlug,
  getBestSellers,
  getDeals,
  getFeaturedProducts,
  getNewArrivals,
  getProductsByCategory,
  getRelatedProducts,
} from './product-queries';
import { loadCatalogState } from './server-store';

export const CATALOG_CACHE_TAG = 'catalog';

async function fetchCatalogApi<T>(path: string): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    next: { tags: [CATALOG_CACHE_TAG], revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Catalog API ${path} failed: ${res.status}`);
  }
  const json = (await res.json()) as { data?: T } & T;
  return (json.data ?? json) as T;
}

async function loadMockCatalog() {
  const state = await loadCatalogState();
  return {
    products: state.products,
    categories: state.categories.filter((c) => c.isActive !== false),
    brands: state.brands.filter((b) => b.isActive !== false),
  };
}

async function loadLiveCatalog() {
  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    fetchCatalogApi<{ items: Product[] }>('/catalog/products?limit=500'),
    fetchCatalogApi<{ tree: Category[] }>('/catalog/categories'),
    fetchCatalogApi<{ items: Brand[] }>('/catalog/brands'),
  ]);
  return {
    products: productsRes.items ?? [],
    categories: categoriesRes.tree ?? [],
    brands: brandsRes.items ?? [],
  };
}

async function loadCatalog() {
  if (env.NEXT_PUBLIC_USE_MOCK_API) return loadMockCatalog();
  return loadLiveCatalog();
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const { products } = await loadCatalog();
  return filterPublishedProducts(products);
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const { categories } = await loadCatalog();
  return categories;
}

export async function getStorefrontBrands(): Promise<Brand[]> {
  const { brands } = await loadCatalog();
  return brands;
}

export async function getAllProductsForStore(): Promise<Product[]> {
  return getStorefrontProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (env.NEXT_PUBLIC_USE_MOCK_API) {
    const products = await getStorefrontProducts();
    return findProductBySlug(products, slug);
  }
  try {
    const res = await fetchCatalogApi<{ product: Product }>(
      `/catalog/products/${encodeURIComponent(slug)}`,
    );
    return res.product;
  } catch {
    return undefined;
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getStorefrontProducts();
  return findProductById(products, id);
}

export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  const products = await getStorefrontProducts();
  return getProductsByCategory(products, categoryId);
}

export async function getRelatedProductsFor(productId: string, limit = 4): Promise<Product[]> {
  const products = await getStorefrontProducts();
  return getRelatedProducts(products, productId, limit);
}

export async function getFeaturedProductsList(limit = 6): Promise<Product[]> {
  const products = await getStorefrontProducts();
  return getFeaturedProducts(products, limit);
}

export async function getBestSellersList(limit = 8): Promise<Product[]> {
  const products = await getStorefrontProducts();
  return getBestSellers(products, limit);
}

export async function getNewArrivalsList(limit = 8): Promise<Product[]> {
  const products = await getStorefrontProducts();
  return getNewArrivals(products, limit);
}

export async function getDealsList(limit = 12): Promise<Product[]> {
  const products = await getStorefrontProducts();
  return getDeals(products, limit);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const categories = await getStorefrontCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await getStorefrontCategories();
  return categories.find((c) => c.id === id);
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  const brands = await getStorefrontBrands();
  return brands.find((b) => b.slug === slug);
}

export async function getTopLevelCategories(): Promise<Category[]> {
  const categories = await getStorefrontCategories();
  return categories.filter((c) => !c.parentId).sort((a, b) => a.position - b.position);
}

export async function getChildCategories(parentSlug: string): Promise<Category[]> {
  const categories = await getStorefrontCategories();
  const parent = categories.find((c) => c.slug === parentSlug);
  if (!parent) return [];
  return categories.filter((c) => c.parentId === parent.id).sort((a, b) => a.position - b.position);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const products = await getStorefrontProducts();
  return products.map((p) => p.slug);
}
