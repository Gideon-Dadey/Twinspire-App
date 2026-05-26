/**
 * Client-only admin backend. Mirrors the `/admin/*` routes implemented
 * in `apps/backend/src/modules/{catalog,orders,coupons,reviews,users}`
 * so that flipping `NEXT_PUBLIC_USE_MOCK_API` does not require any
 * component changes.
 *
 * State is persisted to localStorage and seeded from the public Phase 6
 * catalog + the admin fixtures in `admin-mock-data.ts`. Re-seed via
 * `adminMockBackend._reset()` from the browser devtools.
 */

import type {
  Brand,
  Category,
  Coupon,
  CurrencyCode,
  Money,
  Order,
  Product,
  Review,
} from '@twinspire/types';

import { brands as seedBrands } from '@/data/brands';
import { categories as seedCategories } from '@/data/categories';
import { products as seedProducts } from '@/data/products';

import {
  ADMIN_AUDIT_LOG,
  ADMIN_COUPONS,
  ADMIN_REVIEWS,
  ALL_ADMIN_ORDERS,
  ALL_MOCK_USERS,
  ADMIN_PASSWORD,
  ADMIN_USER_ID,
  MANAGER_USER_ID,
  buildAdminAnalytics,
  type AuditEvent,
} from './admin-mock-data';
import { MockApiError } from './mock-backend';
import { mockKeys, readJson, removeKey, writeJson } from './mock-storage';
import type { MockUserRecord } from './mock-data';
import type {
  AdminAnalyticsResponse,
  AdminAuditListQuery,
  AdminAuditResponse,
  AdminBrandListItem,
  AdminCategoryListItem,
  AdminCouponListQuery,
  AdminCouponsResponse,
  AdminCustomerDetail,
  AdminCustomerListQuery,
  AdminCustomerListItem,
  AdminCustomersResponse,
  AdminModerateReviewInput,
  AdminOrderListItem,
  AdminOrderListQuery,
  AdminOrderUpdateInput,
  AdminOrdersResponse,
  AdminProductListQuery,
  AdminProductsResponse,
  AdminRefundInput,
  AdminReviewItem,
  AdminReviewListQuery,
  AdminReviewsResponse,
  AdminUpdateCustomerInput,
  AdminUpsertBrandInput,
  AdminUpsertCategoryInput,
  AdminUpsertCouponInput,
  AdminUpsertProductInput,
} from './admin-types';

/* -------------------------------------------------------------------------- */
/* localStorage keys                                                          */
/* -------------------------------------------------------------------------- */

const ADMIN_KEYS = {
  products: 'twinspire.admin.products',
  categories: 'twinspire.admin.categories',
  brands: 'twinspire.admin.brands',
  orders: 'twinspire.admin.orders',
  coupons: 'twinspire.admin.coupons',
  reviews: 'twinspire.admin.reviews',
  audit: 'twinspire.admin.audit',
  users: 'twinspire.admin.users',
} as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function nowIso(): string {
  return new Date().toISOString();
}

function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function money(amount: number, currency: CurrencyCode = 'USD'): Money {
  return { amount, currency };
}

function readSessionUserId(): string | null {
  return readJson<string | null>(mockKeys.session, null);
}

function requireStaff(): string {
  const userId = readSessionUserId();
  if (!userId) throw new MockApiError(401, 'UNAUTHENTICATED', 'Sign in required');
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new MockApiError(401, 'UNAUTHENTICATED', 'Session expired');
  if (!['admin', 'superadmin', 'manager', 'staff', 'support'].includes(user.role)) {
    throw new MockApiError(403, 'FORBIDDEN', 'Staff access required');
  }
  return userId;
}

function requireRole(roles: Array<MockUserRecord['role']>): MockUserRecord {
  const userId = requireStaff();
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new MockApiError(401, 'UNAUTHENTICATED', 'Session expired');
  if (!roles.includes(user.role)) {
    throw new MockApiError(403, 'FORBIDDEN', `Requires role: ${roles.join(', ')}`);
  }
  return user;
}

/* -------------------------------------------------------------------------- */
/* Seeded storage accessors                                                   */
/* -------------------------------------------------------------------------- */

function readWithSeed<T>(key: string, seed: T[]): T[] {
  const existing = readJson<T[] | null>(key, null);
  if (existing && existing.length) return existing;
  writeJson(key, seed);
  return seed;
}

function readProducts(): Product[] {
  return readWithSeed<Product>(ADMIN_KEYS.products, seedProducts);
}
function writeProducts(value: Product[]): void {
  writeJson(ADMIN_KEYS.products, value);
}

function readCategories(): Category[] {
  return readWithSeed<Category>(ADMIN_KEYS.categories, seedCategories);
}
function writeCategories(value: Category[]): void {
  writeJson(ADMIN_KEYS.categories, value);
}

function readBrands(): Brand[] {
  return readWithSeed<Brand>(ADMIN_KEYS.brands, seedBrands);
}
function writeBrands(value: Brand[]): void {
  writeJson(ADMIN_KEYS.brands, value);
}

function readOrders(): Order[] {
  return readWithSeed<Order>(ADMIN_KEYS.orders, ALL_ADMIN_ORDERS);
}
function writeOrders(value: Order[]): void {
  writeJson(ADMIN_KEYS.orders, value);
}

function readCoupons(): Coupon[] {
  return readWithSeed<Coupon>(ADMIN_KEYS.coupons, ADMIN_COUPONS);
}
function writeCoupons(value: Coupon[]): void {
  writeJson(ADMIN_KEYS.coupons, value);
}

function readReviews(): Review[] {
  return readWithSeed<Review>(ADMIN_KEYS.reviews, ADMIN_REVIEWS);
}
function writeReviews(value: Review[]): void {
  writeJson(ADMIN_KEYS.reviews, value);
}

function readAudit(): AuditEvent[] {
  return readWithSeed<AuditEvent>(ADMIN_KEYS.audit, ADMIN_AUDIT_LOG);
}
function writeAudit(value: AuditEvent[]): void {
  writeJson(ADMIN_KEYS.audit, value);
}

function readUsers(): MockUserRecord[] {
  const fromPhase7 = readJson<MockUserRecord[] | null>(mockKeys.users, null);
  const adminSide = readJson<MockUserRecord[] | null>(ADMIN_KEYS.users, null);
  if (adminSide && adminSide.length) {
    // Merge any newly registered Phase 7 users that aren't in the admin
    // roster yet (so the admin sees real-time signups).
    const ids = new Set(adminSide.map((u) => u.id));
    const merged = [...adminSide];
    for (const u of fromPhase7 ?? []) {
      if (!ids.has(u.id)) merged.push(u);
    }
    return merged;
  }
  // Seed admin store with the full roster (admin + manager + customers).
  const seed = ALL_MOCK_USERS;
  writeJson(ADMIN_KEYS.users, seed);
  // Also ensure the Phase 7 session store contains admin + manager so
  // they can sign in via /login.
  const passwords = readJson<Record<string, string>>(mockKeys.passwords, {});
  passwords[ADMIN_USER_ID] = ADMIN_PASSWORD;
  passwords[MANAGER_USER_ID] = ADMIN_PASSWORD;
  writeJson(mockKeys.passwords, passwords);
  const usersList = readJson<MockUserRecord[]>(mockKeys.users, []);
  const usersById = new Map(usersList.map((u) => [u.id, u]));
  for (const u of seed) {
    if (!usersById.has(u.id)) usersList.push(u);
  }
  writeJson(mockKeys.users, usersList);
  return seed;
}

function writeUsers(value: MockUserRecord[]): void {
  writeJson(ADMIN_KEYS.users, value);
}

function logAudit(event: Omit<AuditEvent, 'id' | 'createdAt' | 'actorId' | 'actorName'> & { actor?: MockUserRecord }): void {
  const actor = event.actor;
  if (!actor) return;
  const list = readAudit();
  list.unshift({
    id: randomId('au'),
    actorId: actor.id,
    actorName: actor.displayName ?? `${actor.firstName} ${actor.lastName}`,
    action: event.action,
    entity: event.entity,
    entityId: event.entityId,
    metadata: event.metadata,
    createdAt: nowIso(),
  });
  writeAudit(list.slice(0, 200));
}

/* -------------------------------------------------------------------------- */
/* Helpers shared by responses                                                */
/* -------------------------------------------------------------------------- */

function toOrderListItem(order: Order, users: MockUserRecord[]): AdminOrderListItem {
  const customer = users.find((u) => u.id === order.userId);
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentStatus: order.paymentStatus,
    placedAt: order.placedAt,
    total: order.totals.total,
    itemCount: order.items.reduce((sum, it) => sum + it.quantity, 0),
    customer: customer
      ? { id: customer.id, name: `${customer.firstName} ${customer.lastName}`, email: customer.email }
      : { id: null, name: 'Guest', email: order.guestEmail ?? '' },
    previewImages: order.items
      .map((it) => it.image?.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, 3),
  };
}

function toCustomerListItem(user: MockUserRecord, orders: Order[]): AdminCustomerListItem {
  const userOrders = orders.filter((o) => o.userId === user.id);
  const lifetime = userOrders.reduce((sum, o) => sum + o.totals.total.amount, 0);
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    orderCount: userOrders.length,
    lifetimeSpend: money(Number(lifetime.toFixed(2))),
    loyaltyPoints: user.loyaltyPoints,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

/* -------------------------------------------------------------------------- */
/* Public surface                                                             */
/* -------------------------------------------------------------------------- */

export const adminMockBackend = {
  /* ---------------- Analytics ----------------- */
  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    requireStaff();
    await delay(120);
    return { summary: buildAdminAnalytics() };
  },

  /* ---------------- Products ----------------- */
  async listProducts(query: AdminProductListQuery = {}): Promise<AdminProductsResponse> {
    requireStaff();
    await delay(120);
    const all = readProducts();
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
    if (query.categoryId) filtered = filtered.filter((p) => p.categoryIds.includes(query.categoryId!));
    if (query.lowStock) {
      filtered = filtered.filter((p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock');
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
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    requireStaff();
    await delay(80);
    const product = readProducts().find((p) => p.id === id || p.slug === id);
    if (!product) throw new MockApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    return { product };
  },

  async createProduct(input: AdminUpsertProductInput): Promise<{ product: Product }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(200);
    const list = readProducts();
    const slug = (input.slug ?? slugify(input.name)) || randomId('p');
    if (list.some((p) => p.slug === slug)) {
      throw new MockApiError(409, 'SLUG_TAKEN', 'Slug is already in use');
    }
    const product: Product = {
      id: randomId('p'),
      sku: input.sku,
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      description: input.description,
      brandId: input.brandId,
      brandName: readBrands().find((b) => b.id === input.brandId)?.name,
      primaryCategoryId: input.primaryCategoryId,
      categoryIds: input.categoryIds ?? [input.primaryCategoryId],
      tags: input.tags ?? [],
      condition: input.condition,
      status: input.status,
      stockStatus: input.stockStatus,
      price: input.price,
      images: input.imageUrl
        ? [{ url: input.imageUrl, alt: input.imageAlt ?? input.name, width: 1200, height: 1500, position: 0 }]
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
    writeProducts([product, ...list]);
    logAudit({ actor, action: 'product.create', entity: 'product', entityId: product.id });
    return { product };
  },

  async updateProduct(id: string, input: Partial<AdminUpsertProductInput>): Promise<{ product: Product }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(180);
    const list = readProducts();
    const target = list.find((p) => p.id === id);
    if (!target) throw new MockApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    const next: Product = {
      ...target,
      ...input,
      slug: input.slug ?? target.slug,
      categoryIds: input.categoryIds ?? target.categoryIds,
      tags: input.tags ?? target.tags,
      price: input.price ?? target.price,
      brandName: input.brandId ? readBrands().find((b) => b.id === input.brandId)?.name : target.brandName,
      images: input.imageUrl
        ? [{ url: input.imageUrl, alt: input.imageAlt ?? input.name ?? target.name, width: 1200, height: 1500, position: 0 }, ...target.images.slice(1)]
        : target.images,
      updatedAt: nowIso(),
    };
    writeProducts(list.map((p) => (p.id === id ? next : p)));
    logAudit({ actor, action: 'product.update', entity: 'product', entityId: id });
    return { product: next };
  },

  async deleteProduct(id: string): Promise<void> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(150);
    const list = readProducts();
    const remaining = list.filter((p) => p.id !== id);
    if (remaining.length === list.length) throw new MockApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    writeProducts(remaining);
    logAudit({ actor, action: 'product.delete', entity: 'product', entityId: id });
  },

  /* ---------------- Categories ----------------- */
  async listCategories(): Promise<{ items: AdminCategoryListItem[] }> {
    requireStaff();
    await delay(60);
    const products = readProducts();
    const items: AdminCategoryListItem[] = readCategories().map((c) => ({
      ...c,
      productCount: products.filter((p) => p.categoryIds.includes(c.id) || p.primaryCategoryId === c.id).length,
    }));
    return { items };
  },

  async createCategory(input: AdminUpsertCategoryInput): Promise<{ category: Category }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(140);
    const list = readCategories();
    const slug = input.slug ?? slugify(input.name);
    if (list.some((c) => c.slug === slug)) throw new MockApiError(409, 'SLUG_TAKEN', 'Slug is in use');
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
      position: list.length,
      isFeatured: input.isFeatured ?? false,
      isActive: input.isActive ?? true,
      productCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    };
    writeCategories([...list, category]);
    logAudit({ actor, action: 'category.create', entity: 'category', entityId: category.id });
    return { category };
  },

  async updateCategory(id: string, input: Partial<AdminUpsertCategoryInput>): Promise<{ category: Category }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(120);
    const list = readCategories();
    const target = list.find((c) => c.id === id);
    if (!target) throw new MockApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
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
    writeCategories(list.map((c) => (c.id === id ? next : c)));
    logAudit({ actor, action: 'category.update', entity: 'category', entityId: id });
    return { category: next };
  },

  async deleteCategory(id: string): Promise<void> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(120);
    const list = readCategories();
    const remaining = list.filter((c) => c.id !== id);
    if (remaining.length === list.length) throw new MockApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
    writeCategories(remaining);
    logAudit({ actor, action: 'category.delete', entity: 'category', entityId: id });
  },

  /* ---------------- Brands ----------------- */
  async listBrands(): Promise<{ items: AdminBrandListItem[] }> {
    requireStaff();
    await delay(60);
    const products = readProducts();
    const items: AdminBrandListItem[] = readBrands().map((b) => ({
      ...b,
      productCount: products.filter((p) => p.brandId === b.id).length,
    }));
    return { items };
  },

  async createBrand(input: AdminUpsertBrandInput): Promise<{ brand: Brand }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(140);
    const list = readBrands();
    const slug = input.slug ?? slugify(input.name);
    if (list.some((b) => b.slug === slug)) throw new MockApiError(409, 'SLUG_TAKEN', 'Slug is in use');
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
    writeBrands([...list, brand]);
    logAudit({ actor, action: 'brand.create', entity: 'brand', entityId: brand.id });
    return { brand };
  },

  async updateBrand(id: string, input: Partial<AdminUpsertBrandInput>): Promise<{ brand: Brand }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(120);
    const list = readBrands();
    const target = list.find((b) => b.id === id);
    if (!target) throw new MockApiError(404, 'BRAND_NOT_FOUND', 'Brand not found');
    const next: Brand = {
      ...target,
      ...input,
      slug: input.slug ?? target.slug,
      isFeatured: input.isFeatured ?? target.isFeatured,
      isActive: input.isActive ?? target.isActive,
      logo: input.logo ?? target.logo,
      updatedAt: nowIso(),
    };
    writeBrands(list.map((b) => (b.id === id ? next : b)));
    logAudit({ actor, action: 'brand.update', entity: 'brand', entityId: id });
    return { brand: next };
  },

  async deleteBrand(id: string): Promise<void> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(120);
    const list = readBrands();
    const remaining = list.filter((b) => b.id !== id);
    if (remaining.length === list.length) throw new MockApiError(404, 'BRAND_NOT_FOUND', 'Brand not found');
    writeBrands(remaining);
    logAudit({ actor, action: 'brand.delete', entity: 'brand', entityId: id });
  },

  /* ---------------- Orders ----------------- */
  async listOrders(query: AdminOrderListQuery = {}): Promise<AdminOrdersResponse> {
    requireStaff();
    await delay(100);
    const users = readUsers();
    let filtered = [...readOrders()].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((o) => o.status === query.status);
    }
    if (query.q) {
      const needle = query.q.toLowerCase();
      filtered = filtered.filter((o) => {
        if (o.orderNumber.toLowerCase().includes(needle)) return true;
        const customer = users.find((u) => u.id === o.userId);
        if (customer && (`${customer.firstName} ${customer.lastName}`.toLowerCase().includes(needle) || customer.email.toLowerCase().includes(needle))) {
          return true;
        }
        if (o.guestEmail && o.guestEmail.toLowerCase().includes(needle)) return true;
        return false;
      });
    }
    const paged = paginate(filtered, query.page, query.perPage ?? 15);
    return {
      ...paged,
      items: paged.items.map((o) => toOrderListItem(o, users)),
    };
  },

  async getOrder(id: string): Promise<{ order: Order; customer?: MockUserRecord }> {
    requireStaff();
    await delay(80);
    const order = readOrders().find((o) => o.id === id || o.orderNumber === id);
    if (!order) throw new MockApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
    const customer = readUsers().find((u) => u.id === order.userId);
    return { order, customer };
  },

  async updateOrder(id: string, input: AdminOrderUpdateInput): Promise<{ order: Order }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(160);
    const orders = readOrders();
    const target = orders.find((o) => o.id === id);
    if (!target) throw new MockApiError(404, 'ORDER_NOT_FOUND', 'Order not found');

    const next: Order = { ...target };
    if (input.status && input.status !== target.status) {
      next.status = input.status;
      next.timeline = [...target.timeline, { status: input.status, occurredAt: nowIso(), note: input.note, byUserId: actor.id }];
      if (input.status === 'shipped') next.shippedAt = nowIso();
      if (input.status === 'delivered') next.deliveredAt = nowIso();
      if (input.status === 'cancelled') next.cancelledAt = nowIso();
      if (input.status === 'paid') next.paidAt = nowIso();
    }
    if (input.fulfillmentStatus) next.fulfillmentStatus = input.fulfillmentStatus;
    if (input.trackingNumber || input.carrier) {
      next.shippingMethod = {
        id: target.shippingMethod?.id ?? 'std',
        name: target.shippingMethod?.name ?? 'Standard',
        carrier: input.carrier ?? target.shippingMethod?.carrier,
        trackingNumber: input.trackingNumber ?? target.shippingMethod?.trackingNumber,
      };
    }
    if (input.note) {
      next.notes = next.notes ? `${next.notes}\n${input.note}` : input.note;
    }
    next.updatedAt = nowIso();
    writeOrders(orders.map((o) => (o.id === id ? next : o)));
    logAudit({ actor, action: 'order.update', entity: 'order', entityId: id, metadata: { status: input.status ?? next.status } });
    return { order: next };
  },

  async refundOrder(id: string, input: AdminRefundInput): Promise<{ order: Order }> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(220);
    const orders = readOrders();
    const target = orders.find((o) => o.id === id);
    if (!target) throw new MockApiError(404, 'ORDER_NOT_FOUND', 'Order not found');
    const next: Order = {
      ...target,
      status: 'refunded',
      paymentStatus: input.amount && input.amount < target.totals.total.amount ? 'partially_refunded' : 'refunded',
      fulfillmentStatus: 'returned',
      timeline: [...target.timeline, { status: 'refunded', occurredAt: nowIso(), note: input.reason, byUserId: actor.id }],
      updatedAt: nowIso(),
    };
    writeOrders(orders.map((o) => (o.id === id ? next : o)));
    logAudit({ actor, action: 'order.refund', entity: 'order', entityId: id, metadata: { amount: input.amount ?? next.totals.total.amount } });
    return { order: next };
  },

  /* ---------------- Coupons ----------------- */
  async listCoupons(query: AdminCouponListQuery = {}): Promise<AdminCouponsResponse> {
    requireStaff();
    await delay(80);
    let list = readCoupons();
    if (query.q) {
      const needle = query.q.toLowerCase();
      list = list.filter(
        (c) => c.code.toLowerCase().includes(needle) || (c.description ?? '').toLowerCase().includes(needle),
      );
    }
    if (typeof query.isActive === 'boolean') {
      list = list.filter((c) => c.isActive === query.isActive);
    }
    return paginate(list, query.page, query.perPage ?? 20);
  },

  async getCoupon(id: string): Promise<{ coupon: Coupon }> {
    requireStaff();
    await delay(60);
    const coupon = readCoupons().find((c) => c.id === id);
    if (!coupon) throw new MockApiError(404, 'COUPON_NOT_FOUND', 'Coupon not found');
    return { coupon };
  },

  async createCoupon(input: AdminUpsertCouponInput): Promise<{ coupon: Coupon }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(160);
    const list = readCoupons();
    if (list.some((c) => c.code.toLowerCase() === input.code.toLowerCase())) {
      throw new MockApiError(409, 'CODE_TAKEN', 'A coupon with this code already exists');
    }
    const coupon: Coupon = {
      id: randomId('cpn'),
      code: input.code.toUpperCase(),
      description: input.description,
      type: input.type,
      value: input.value,
      currency: input.currency,
      minSubtotal: input.minSubtotal,
      maxDiscount: input.maxDiscount,
      usageLimit: input.usageLimit,
      usageLimitPerUser: input.usageLimitPerUser,
      usedCount: 0,
      startsAt: input.startsAt ?? nowIso(),
      expiresAt: input.expiresAt ?? undefined,
      isActive: input.isActive,
      stackable: input.stackable,
      firstOrderOnly: input.firstOrderOnly,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    };
    writeCoupons([coupon, ...list]);
    logAudit({ actor, action: 'coupon.create', entity: 'coupon', entityId: coupon.id, metadata: { code: coupon.code } });
    return { coupon };
  },

  async updateCoupon(id: string, input: Partial<AdminUpsertCouponInput>): Promise<{ coupon: Coupon }> {
    const actor = requireRole(['admin', 'superadmin', 'manager']);
    await delay(140);
    const list = readCoupons();
    const target = list.find((c) => c.id === id);
    if (!target) throw new MockApiError(404, 'COUPON_NOT_FOUND', 'Coupon not found');
    const next: Coupon = {
      ...target,
      ...input,
      code: input.code ? input.code.toUpperCase() : target.code,
      expiresAt: input.expiresAt === null ? undefined : input.expiresAt ?? target.expiresAt,
      updatedAt: nowIso(),
    };
    writeCoupons(list.map((c) => (c.id === id ? next : c)));
    logAudit({ actor, action: 'coupon.update', entity: 'coupon', entityId: id, metadata: { code: next.code } });
    return { coupon: next };
  },

  async deleteCoupon(id: string): Promise<void> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(120);
    const list = readCoupons();
    const remaining = list.filter((c) => c.id !== id);
    if (remaining.length === list.length) throw new MockApiError(404, 'COUPON_NOT_FOUND', 'Coupon not found');
    writeCoupons(remaining);
    logAudit({ actor, action: 'coupon.delete', entity: 'coupon', entityId: id });
  },

  /* ---------------- Reviews ----------------- */
  async listReviews(query: AdminReviewListQuery = {}): Promise<AdminReviewsResponse> {
    requireStaff();
    await delay(80);
    let list = readReviews();
    if (query.status && query.status !== 'all') {
      list = list.filter((r) => r.status === query.status);
    }
    if (query.rating) list = list.filter((r) => r.rating === query.rating);
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const products = readProducts();
    const items: AdminReviewItem[] = list.map((review) => {
      const product = products.find((p) => p.id === review.productId);
      return {
        ...review,
        product: product
          ? { id: product.id, name: product.name, slug: product.slug, images: product.images }
          : {
              id: review.productId,
              name: 'Unknown product',
              slug: '',
              images: [],
            },
      };
    });
    return paginate(items, query.page, query.perPage ?? 15);
  },

  async moderateReview(id: string, input: AdminModerateReviewInput): Promise<{ review: Review }> {
    const actor = requireRole(['admin', 'superadmin', 'manager', 'support']);
    await delay(140);
    const list = readReviews();
    const target = list.find((r) => r.id === id);
    if (!target) throw new MockApiError(404, 'REVIEW_NOT_FOUND', 'Review not found');
    const next: Review = { ...target, status: input.status, moderatorNote: input.moderatorNote, updatedAt: nowIso() };
    writeReviews(list.map((r) => (r.id === id ? next : r)));
    logAudit({ actor, action: 'review.moderate', entity: 'review', entityId: id, metadata: { decision: input.status } });
    return { review: next };
  },

  async deleteReview(id: string): Promise<void> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(100);
    const list = readReviews();
    const remaining = list.filter((r) => r.id !== id);
    if (remaining.length === list.length) throw new MockApiError(404, 'REVIEW_NOT_FOUND', 'Review not found');
    writeReviews(remaining);
    logAudit({ actor, action: 'review.delete', entity: 'review', entityId: id });
  },

  /* ---------------- Customers ----------------- */
  async listCustomers(query: AdminCustomerListQuery = {}): Promise<AdminCustomersResponse> {
    requireStaff();
    await delay(80);
    let users = readUsers().filter((u) => u.role === 'customer');
    if (query.status && query.status !== 'all') {
      users = users.filter((u) => u.status === query.status);
    }
    if (query.q) {
      const needle = query.q.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(needle) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(needle),
      );
    }
    users = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const orders = readOrders();
    const items = users.map((u) => toCustomerListItem(u, orders));
    return paginate(items, query.page, query.perPage ?? 20);
  },

  async getCustomer(id: string): Promise<{ customer: AdminCustomerDetail }> {
    requireStaff();
    await delay(70);
    const user = readUsers().find((u) => u.id === id);
    if (!user) throw new MockApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    const orders = readOrders();
    const item = toCustomerListItem(user, orders);
    const recentOrders = orders
      .filter((o) => o.userId === id)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
      .slice(0, 5)
      .map((o) => toOrderListItem(o, readUsers()));
    return {
      customer: {
        ...item,
        phone: user.phone,
        preferences: user.preferences,
        recentOrders,
      },
    };
  },

  async updateCustomer(id: string, input: AdminUpdateCustomerInput): Promise<{ customer: AdminCustomerListItem }> {
    const actor = requireRole(['admin', 'superadmin']);
    await delay(120);
    const users = readUsers();
    const target = users.find((u) => u.id === id);
    if (!target) throw new MockApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    if (input.role && target.id === actor.id) {
      throw new MockApiError(400, 'CANNOT_CHANGE_OWN_ROLE', "You can't change your own role");
    }
    const next: MockUserRecord = {
      ...target,
      status: input.status ?? target.status,
      role: input.role ?? target.role,
      updatedAt: nowIso(),
    };
    writeUsers(users.map((u) => (u.id === id ? next : u)));
    if (input.status && input.status !== target.status) {
      logAudit({ actor, action: `user.${input.status === 'suspended' ? 'suspend' : input.status}`, entity: 'user', entityId: id });
    }
    if (input.role && input.role !== target.role) {
      logAudit({ actor, action: 'user.role.update', entity: 'user', entityId: id, metadata: { role: input.role } });
    }
    return { customer: toCustomerListItem(next, readOrders()) };
  },

  /* ---------------- Audit ----------------- */
  async listAudit(query: AdminAuditListQuery = {}): Promise<AdminAuditResponse> {
    requireStaff();
    await delay(60);
    let list = [...readAudit()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (query.entity) list = list.filter((e) => e.entity === query.entity);
    if (query.q) {
      const needle = query.q.toLowerCase();
      list = list.filter(
        (e) =>
          e.action.toLowerCase().includes(needle) ||
          e.actorName.toLowerCase().includes(needle) ||
          (e.entityId ?? '').toLowerCase().includes(needle),
      );
    }
    return paginate(list, query.page, query.perPage ?? 25);
  },

  /* ---------------- demo helpers ----------------- */
  async _reset(): Promise<void> {
    removeKey(ADMIN_KEYS.products);
    removeKey(ADMIN_KEYS.categories);
    removeKey(ADMIN_KEYS.brands);
    removeKey(ADMIN_KEYS.orders);
    removeKey(ADMIN_KEYS.coupons);
    removeKey(ADMIN_KEYS.reviews);
    removeKey(ADMIN_KEYS.audit);
    removeKey(ADMIN_KEYS.users);
    // Re-seed lazily on next read.
    readProducts();
    readCategories();
    readBrands();
    readOrders();
    readCoupons();
    readReviews();
    readAudit();
    readUsers();
  },
};

export { ADMIN_KEYS };
