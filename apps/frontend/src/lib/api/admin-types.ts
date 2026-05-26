import type {
  Brand,
  Category,
  Coupon,
  Money,
  Order,
  OrderStatus,
  Product,
  PublicUser,
  Review,
  ReviewStatus,
} from '@twinspire/types';

import type { AdminAnalyticsSummary, AuditEvent } from './admin-mock-data';

/* -------------------------------------------------------------------------- */
/* Common list response shape                                                 */
/* -------------------------------------------------------------------------- */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

export interface AdminProductListQuery {
  page?: number;
  perPage?: number;
  q?: string;
  status?: Product['status'] | 'all';
  brandId?: string;
  categoryId?: string;
  lowStock?: boolean;
}

export interface AdminProductsResponse extends PaginatedResponse<Product> {
  totals: {
    active: number;
    draft: number;
    archived: number;
    outOfStock: number;
    lowStock: number;
  };
}

export interface AdminUpsertProductInput {
  name: string;
  slug?: string;
  sku: string;
  brandId: string;
  primaryCategoryId: string;
  categoryIds?: string[];
  shortDescription?: string;
  description: string;
  status: Product['status'];
  stockStatus: Product['stockStatus'];
  condition: Product['condition'];
  price: Product['price'];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
}

export interface AdminUpsertCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  iconUrl?: string;
  image?: { url: string; alt: string };
}

export interface AdminUpsertBrandInput {
  name: string;
  slug?: string;
  description?: string;
  tagline?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  logo?: { url: string; alt: string };
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export interface AdminOrderListQuery {
  page?: number;
  perPage?: number;
  status?: OrderStatus | 'all';
  q?: string;
}

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfillmentStatus: Order['fulfillmentStatus'];
  paymentStatus: Order['paymentStatus'];
  placedAt: string;
  total: Money;
  itemCount: number;
  customer: { id: string | null; name: string; email: string };
  previewImages: string[];
};

export type AdminOrdersResponse = PaginatedResponse<AdminOrderListItem>;

export interface AdminOrderUpdateInput {
  status?: OrderStatus;
  fulfillmentStatus?: Order['fulfillmentStatus'];
  note?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface AdminRefundInput {
  amount?: number;
  reason?: string;
}

/* -------------------------------------------------------------------------- */
/* Coupons                                                                    */
/* -------------------------------------------------------------------------- */

export interface AdminCouponListQuery {
  page?: number;
  perPage?: number;
  q?: string;
  isActive?: boolean | 'all';
}

export type AdminCouponsResponse = PaginatedResponse<Coupon>;

export interface AdminUpsertCouponInput {
  code: string;
  description?: string;
  type: Coupon['type'];
  value: number;
  currency?: string;
  minSubtotal?: Money;
  maxDiscount?: Money;
  usageLimit?: number;
  usageLimitPerUser?: number;
  startsAt?: string;
  expiresAt?: string | null;
  isActive: boolean;
  stackable: boolean;
  firstOrderOnly: boolean;
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                    */
/* -------------------------------------------------------------------------- */

export interface AdminReviewListQuery {
  page?: number;
  perPage?: number;
  status?: ReviewStatus | 'all';
  rating?: number;
}

export type AdminReviewItem = Review & {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images'>;
};

export type AdminReviewsResponse = PaginatedResponse<AdminReviewItem>;

export interface AdminModerateReviewInput {
  status: 'approved' | 'rejected' | 'flagged';
  moderatorNote?: string;
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

export interface AdminCustomerListQuery {
  page?: number;
  perPage?: number;
  q?: string;
  status?: 'all' | 'active' | 'suspended' | 'banned' | 'pending';
}

export interface AdminCustomerListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  status: PublicUser['status'];
  role: PublicUser['role'];
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  lifetimeSpend: Money;
  loyaltyPoints: number;
  twoFactorEnabled: boolean;
}

export type AdminCustomersResponse = PaginatedResponse<AdminCustomerListItem>;

export interface AdminCustomerDetail extends AdminCustomerListItem {
  phone?: string;
  preferences: PublicUser['preferences'];
  recentOrders: AdminOrderListItem[];
}

export interface AdminUpdateCustomerInput {
  status?: PublicUser['status'];
  role?: PublicUser['role'];
}

/* -------------------------------------------------------------------------- */
/* Audit log + analytics                                                      */
/* -------------------------------------------------------------------------- */

export interface AdminAuditListQuery {
  page?: number;
  perPage?: number;
  entity?: string;
  q?: string;
}

export type AdminAuditResponse = PaginatedResponse<AuditEvent>;

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary;
}

/* -------------------------------------------------------------------------- */
/* Taxonomy responses                                                         */
/* -------------------------------------------------------------------------- */

export interface AdminCategoryListItem extends Category {
  productCount: number;
}

export interface AdminBrandListItem extends Brand {
  productCount: number;
}
