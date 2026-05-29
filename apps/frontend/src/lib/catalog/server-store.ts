import fs from 'node:fs/promises';
import path from 'node:path';

import type { Brand, Category, Product } from '@twinspire/types';

import { brands as seedBrands } from '@/data/brands';
import { categories as seedCategories } from '@/data/categories';
import { products as seedProducts } from '@/data/products';
import type {
  AdminProductListQuery,
  AdminUpsertBrandInput,
  AdminUpsertCategoryInput,
  AdminUpsertProductInput,
} from '@/lib/api/admin-types';

export interface CatalogState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  updatedAt: string;
}

const STORE_DIR = path.join(process.cwd(), '.catalog-store');
const STORE_FILE = path.join(STORE_DIR, 'state.json');

let memoryCache: CatalogState | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function paginate<T>(items: T[], page = 1, perPage = 20) {
  const safePage = Math.max(1, page);
  const safePerPage = Math.max(1, Math.min(100, perPage));
  const start = (safePage - 1) * safePerPage;
  const slice = items.slice(start, start + safePerPage);
  return {
    items: slice,
    total: items.length,
    page: safePage,
    perPage: safePerPage,
    totalPages: Math.max(1, Math.ceil(items.length / safePerPage)),
  };
}

function seedState(): CatalogState {
  return {
    products: seedProducts,
    categories: seedCategories,
    brands: seedBrands,
    updatedAt: nowIso(),
  };
}

export async function loadCatalogState(): Promise<CatalogState> {
  if (memoryCache) return memoryCache;
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8');
    memoryCache = JSON.parse(raw) as CatalogState;
    return memoryCache;
  } catch {
    memoryCache = seedState();
    await persistCatalogState(memoryCache);
    return memoryCache;
  }
}

export async function persistCatalogState(state: CatalogState): Promise<void> {
  memoryCache = { ...state, updatedAt: nowIso() };
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(memoryCache, null, 2), 'utf8');
}

export async function replaceCatalogState(partial: Partial<CatalogState>): Promise<CatalogState> {
  const current = await loadCatalogState();
  const next: CatalogState = {
    products: partial.products ?? current.products,
    categories: partial.categories ?? current.categories,
    brands: partial.brands ?? current.brands,
    updatedAt: nowIso(),
  };
  await persistCatalogState(next);
  return next;
}

export async function listAllProducts(): Promise<Product[]> {
  return (await loadCatalogState()).products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const state = await loadCatalogState();
  return state.products.find((p) => p.id === id || p.slug === id);
}

export async function listProductsForAdmin(query: AdminProductListQuery = {}) {
  const all = (await loadCatalogState()).products;
  let filtered = all;
  if (query.q) {
    const needle = query.q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle),
    );
  }
  if (query.status && query.status !== 'all') {
    filtered = filtered.filter((p) => p.status === query.status);
  }
  if (query.brandId) filtered = filtered.filter((p) => p.brandId === query.brandId);
  if (query.categoryId)
    filtered = filtered.filter((p) => p.categoryIds.includes(query.categoryId!));
  if (query.lowStock) {
    filtered = filtered.filter(
      (p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock',
    );
  }
  const totals = {
    active: all.filter((p) => p.status === 'published').length,
    draft: all.filter((p) => p.status === 'draft').length,
    archived: all.filter((p) => p.status === 'archived').length,
    outOfStock: all.filter((p) => p.stockStatus === 'out_of_stock').length,
    lowStock: all.filter((p) => p.stockStatus === 'low_stock').length,
  };
  const paged = paginate(filtered, query.page, query.perPage ?? 12);
  return { ...paged, totals };
}

export async function createProduct(input: AdminUpsertProductInput): Promise<Product> {
  const state = await loadCatalogState();
  const slug = (input.slug ?? slugify(input.name)) || randomId('p');
  if (state.products.some((p) => p.slug === slug)) {
    throw new Error('SLUG_TAKEN');
  }
  const product: Product = {
    id: randomId('p'),
    sku: input.sku,
    name: input.name,
    slug,
    shortDescription: input.shortDescription,
    description: input.description,
    brandId: input.brandId,
    brandName: state.brands.find((b) => b.id === input.brandId)?.name,
    primaryCategoryId: input.primaryCategoryId,
    categoryIds: input.categoryIds ?? [input.primaryCategoryId],
    tags: input.tags ?? [],
    condition: input.condition,
    status: input.status,
    stockStatus: input.stockStatus,
    price: input.price,
    images: input.imageUrl
      ? [
          {
            url: input.imageUrl,
            alt: input.imageAlt ?? input.name,
            width: 1200,
            height: 1500,
            position: 0,
          },
        ]
      : [],
    attributes: [],
    specifications: [],
    variants: [],
    hasVariants: false,
    isFeatured: input.isFeatured,
    isBestSeller: input.isBestSeller,
    isNewArrival: input.isNewArrival,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    deletedAt: null,
  };
  await persistCatalogState({ ...state, products: [product, ...state.products] });
  return product;
}

export async function updateProduct(
  id: string,
  input: Partial<AdminUpsertProductInput>,
): Promise<Product> {
  const state = await loadCatalogState();
  const target = state.products.find((p) => p.id === id);
  if (!target) throw new Error('PRODUCT_NOT_FOUND');
  const next: Product = {
    ...target,
    ...input,
    slug: input.slug ?? target.slug,
    categoryIds: input.categoryIds ?? target.categoryIds,
    tags: input.tags ?? target.tags,
    price: input.price ?? target.price,
    brandName: input.brandId
      ? state.brands.find((b) => b.id === input.brandId)?.name
      : target.brandName,
    images: input.imageUrl
      ? [
          {
            url: input.imageUrl,
            alt: input.imageAlt ?? input.name ?? target.name,
            width: 1200,
            height: 1500,
            position: 0,
          },
          ...target.images.slice(1),
        ]
      : target.images,
    updatedAt: nowIso(),
  };
  await persistCatalogState({
    ...state,
    products: state.products.map((p) => (p.id === id ? next : p)),
  });
  return next;
}

export async function deleteProduct(id: string): Promise<void> {
  const state = await loadCatalogState();
  const remaining = state.products.filter((p) => p.id !== id);
  if (remaining.length === state.products.length) throw new Error('PRODUCT_NOT_FOUND');
  await persistCatalogState({ ...state, products: remaining });
}

export async function listAllCategories(): Promise<Category[]> {
  return (await loadCatalogState()).categories;
}

export async function createCategory(input: AdminUpsertCategoryInput): Promise<Category> {
  const state = await loadCatalogState();
  const slug = input.slug ?? slugify(input.name);
  if (state.categories.some((c) => c.slug === slug)) throw new Error('SLUG_TAKEN');
  const category: Category = {
    id: randomId('c'),
    name: input.name,
    slug,
    description: input.description,
    image: input.image,
    icon: input.iconUrl,
    parentId: input.parentId ?? null,
    ancestors: [],
    level: input.parentId ? 1 : 0,
    path: `/${slug}`,
    position: state.categories.length,
    isFeatured: input.isFeatured ?? false,
    isActive: input.isActive ?? true,
    productCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    deletedAt: null,
  };
  await persistCatalogState({ ...state, categories: [...state.categories, category] });
  return category;
}

export async function updateCategory(
  id: string,
  input: Partial<AdminUpsertCategoryInput>,
): Promise<Category> {
  const state = await loadCatalogState();
  const target = state.categories.find((c) => c.id === id);
  if (!target) throw new Error('CATEGORY_NOT_FOUND');
  const next: Category = {
    ...target,
    ...input,
    slug: input.slug ?? target.slug,
    icon: input.iconUrl ?? target.icon,
    image: input.image ?? target.image,
    parentId: input.parentId ?? target.parentId ?? null,
    isFeatured: input.isFeatured ?? target.isFeatured,
    isActive: input.isActive ?? target.isActive,
    updatedAt: nowIso(),
  };
  await persistCatalogState({
    ...state,
    categories: state.categories.map((c) => (c.id === id ? next : c)),
  });
  return next;
}

export async function deleteCategory(id: string): Promise<void> {
  const state = await loadCatalogState();
  const remaining = state.categories.filter((c) => c.id !== id);
  if (remaining.length === state.categories.length) throw new Error('CATEGORY_NOT_FOUND');
  await persistCatalogState({ ...state, categories: remaining });
}

export async function listAllBrands(): Promise<Brand[]> {
  return (await loadCatalogState()).brands;
}

export async function createBrand(input: AdminUpsertBrandInput): Promise<Brand> {
  const state = await loadCatalogState();
  const slug = input.slug ?? slugify(input.name);
  if (state.brands.some((b) => b.slug === slug)) throw new Error('SLUG_TAKEN');
  const brand: Brand = {
    id: randomId('b'),
    name: input.name,
    slug,
    description: input.description,
    logo: input.logo,
    isFeatured: input.isFeatured ?? false,
    isActive: input.isActive ?? true,
    productCount: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    deletedAt: null,
  };
  await persistCatalogState({ ...state, brands: [...state.brands, brand] });
  return brand;
}

export async function updateBrand(
  id: string,
  input: Partial<AdminUpsertBrandInput>,
): Promise<Brand> {
  const state = await loadCatalogState();
  const target = state.brands.find((b) => b.id === id);
  if (!target) throw new Error('BRAND_NOT_FOUND');
  const next: Brand = {
    ...target,
    ...input,
    slug: input.slug ?? target.slug,
    isFeatured: input.isFeatured ?? target.isFeatured,
    isActive: input.isActive ?? target.isActive,
    logo: input.logo ?? target.logo,
    updatedAt: nowIso(),
  };
  await persistCatalogState({
    ...state,
    brands: state.brands.map((b) => (b.id === id ? next : b)),
  });
  return next;
}

export async function deleteBrand(id: string): Promise<void> {
  const state = await loadCatalogState();
  const remaining = state.brands.filter((b) => b.id !== id);
  if (remaining.length === state.brands.length) throw new Error('BRAND_NOT_FOUND');
  await persistCatalogState({ ...state, brands: remaining });
}

export async function resetCatalogState(): Promise<CatalogState> {
  memoryCache = null;
  try {
    await fs.unlink(STORE_FILE);
  } catch {
    /* ignore missing file */
  }
  return loadCatalogState();
}
