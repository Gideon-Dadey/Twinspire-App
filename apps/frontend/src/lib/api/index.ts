/**
 * Single typed entry point for all auth/users/orders/wishlist calls in
 * the frontend. When `NEXT_PUBLIC_USE_MOCK_API=true` (default during
 * Phase 7) every method talks to the in-browser `mockBackend`. When
 * disabled, calls are forwarded to the real Express API at
 * `NEXT_PUBLIC_API_URL` with bearer-token auth + automatic refresh.
 */

import { env } from '@/env';

import { clearAccessToken, setAccessToken } from './access-token';
import { adminMockBackend } from './admin-mock-backend';
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
  AdminOrderListQuery,
  AdminOrderUpdateInput,
  AdminOrdersResponse,
  AdminProductListQuery,
  AdminProductsResponse,
  AdminRefundInput,
  AdminReviewListQuery,
  AdminReviewsResponse,
  AdminUpdateCustomerInput,
  AdminUpsertBrandInput,
  AdminUpsertCategoryInput,
  AdminUpsertCouponInput,
  AdminUpsertProductInput,
} from './admin-types';
import { authedApi } from './client';
import { MockApiError, mockBackend } from './mock-backend';
import type {
  AddressListResponse,
  AuthRegisterResponse,
  AuthSession,
  AuthSessionResponse,
  ChangePasswordInput,
  CreateAddressInput,
  LoginInput,
  MessageResponse,
  OrderListResponse,
  RecentlyViewedResponse,
  RegisterInput,
  ResetPasswordInput,
  SocialLoginInput,
  TwoFactorSetupResult,
  UpdateAddressInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  WishlistResponse,
} from './types';

import type {
  Address,
  Brand,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Product,
  PublicUser,
  Review,
} from '@twinspire/types';

type QueryRecord = Record<string, string | number | boolean | undefined | null>;

const isMockMode = (): boolean => env.NEXT_PUBLIC_USE_MOCK_API;

async function revalidateStorefrontAfterCatalogChange(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/catalog/revalidate', { method: 'POST' });
  } catch {
    /* non-fatal */
  }
}

export const api = {
  auth: {
    async register(input: RegisterInput): Promise<AuthRegisterResponse> {
      if (isMockMode()) return mockBackend.register(input);
      return authedApi.post<AuthRegisterResponse>('/auth/register', input);
    },
    async login(input: LoginInput): Promise<AuthSessionResponse> {
      const result = isMockMode()
        ? await mockBackend.login(input)
        : await authedApi.post<AuthSessionResponse>('/auth/login', input);
      setAccessToken(result.accessToken, result.accessExpiresAt);
      return result;
    },
    async refresh(): Promise<AuthSessionResponse> {
      const result = isMockMode()
        ? await mockBackend.refresh()
        : await authedApi.post<AuthSessionResponse>('/auth/refresh', {});
      setAccessToken(result.accessToken, result.accessExpiresAt);
      return result;
    },
    async logout(everywhere = false): Promise<void> {
      try {
        if (isMockMode()) await mockBackend.logout(everywhere);
        else await authedApi.post<void>('/auth/logout', { everywhere });
      } finally {
        clearAccessToken();
      }
    },
    async me(): Promise<{ user: PublicUser }> {
      if (isMockMode()) return mockBackend.me();
      return authedApi.get<{ user: PublicUser }>('/auth/me');
    },
    async verifyEmail(token: string): Promise<MessageResponse> {
      if (isMockMode()) return mockBackend.verifyEmail({ token });
      return authedApi.post<MessageResponse>('/auth/verify-email', { token });
    },
    async resendVerifyEmail(email: string): Promise<void> {
      if (isMockMode()) return mockBackend.resendVerifyEmail(email);
      await authedApi.post<void>('/auth/resend-verify', { email });
    },
    async requestPasswordReset(email: string): Promise<void> {
      if (isMockMode()) return mockBackend.requestPasswordReset(email);
      await authedApi.post<void>('/auth/password/reset/request', { email });
    },
    async resetPassword(input: ResetPasswordInput): Promise<void> {
      if (isMockMode()) return mockBackend.resetPassword(input);
      await authedApi.post<void>('/auth/password/reset', input);
    },
    async changePassword(input: ChangePasswordInput): Promise<void> {
      if (isMockMode()) return mockBackend.changePassword(input);
      await authedApi.post<void>('/auth/password/change', input);
      clearAccessToken();
    },
    async begin2faSetup(): Promise<TwoFactorSetupResult> {
      if (isMockMode()) return mockBackend.begin2faSetup();
      return authedApi.post<TwoFactorSetupResult>('/auth/2fa/setup');
    },
    async confirm2faSetup(
      totpCode: string,
    ): Promise<{ twoFactorEnabled: boolean; backupCodes: string[] }> {
      if (isMockMode()) return mockBackend.confirm2faSetup(totpCode);
      return authedApi.post<{ twoFactorEnabled: boolean; backupCodes: string[] }>(
        '/auth/2fa/confirm',
        { totpCode },
      );
    },
    async disable2fa(password: string): Promise<void> {
      if (isMockMode()) return mockBackend.disable2fa(password);
      await authedApi.post<void>('/auth/2fa/disable', { password });
    },
    async listSessions(): Promise<{ sessions: AuthSession[] }> {
      if (isMockMode()) return mockBackend.listSessions();
      return authedApi.get<{ sessions: AuthSession[] }>('/auth/sessions');
    },
    async revokeSession(sessionId: string): Promise<void> {
      if (isMockMode()) return mockBackend.revokeSession(sessionId);
      await authedApi.delete<void>(`/auth/sessions/${sessionId}`);
    },
    async socialLogin(input: SocialLoginInput): Promise<AuthSessionResponse> {
      const result = isMockMode()
        ? await mockBackend.socialLogin(input)
        : await authedApi.post<AuthSessionResponse>('/auth/social', input);
      setAccessToken(result.accessToken, result.accessExpiresAt);
      return result;
    },
  },
  users: {
    async updateProfile(input: UpdateProfileInput): Promise<{ user: PublicUser }> {
      if (isMockMode()) return mockBackend.updateProfile(input);
      return authedApi.patch<{ user: PublicUser }>('/users/me', input);
    },
    async updatePreferences(input: UpdatePreferencesInput): Promise<{ user: PublicUser }> {
      if (isMockMode()) return mockBackend.updatePreferences(input);
      return authedApi.patch<{ user: PublicUser }>('/users/me/preferences', input);
    },
    async deleteAccount(): Promise<void> {
      if (isMockMode()) return mockBackend.deleteAccount();
      await authedApi.delete<void>('/users/me');
      clearAccessToken();
    },
    async listAddresses(): Promise<AddressListResponse> {
      if (isMockMode()) return mockBackend.listAddresses();
      return authedApi.get<AddressListResponse>('/users/me/addresses');
    },
    async createAddress(input: CreateAddressInput): Promise<{ address: Address }> {
      if (isMockMode()) return mockBackend.createAddress(input);
      return authedApi.post<{ address: Address }>('/users/me/addresses', input);
    },
    async updateAddress(id: string, input: UpdateAddressInput): Promise<{ address: Address }> {
      if (isMockMode()) return mockBackend.updateAddress(id, input);
      return authedApi.patch<{ address: Address }>(`/users/me/addresses/${id}`, input);
    },
    async deleteAddress(id: string): Promise<void> {
      if (isMockMode()) return mockBackend.deleteAddress(id);
      await authedApi.delete<void>(`/users/me/addresses/${id}`);
    },
    async setDefaultAddress(id: string): Promise<{ address: Address }> {
      if (isMockMode()) return mockBackend.setDefaultAddress(id);
      return authedApi.post<{ address: Address }>(`/users/me/addresses/${id}/default`);
    },
  },
  orders: {
    async list(
      options: { page?: number; perPage?: number; status?: OrderStatus } = {},
    ): Promise<OrderListResponse> {
      if (isMockMode()) return mockBackend.listOrders(options);
      return authedApi.get<OrderListResponse>('/orders', { query: options });
    },
    async get(id: string): Promise<{ order: Order }> {
      if (isMockMode()) return mockBackend.getOrder(id);
      return authedApi.get<{ order: Order }>(`/orders/${id}`);
    },
    async cancel(id: string): Promise<{ order: Order }> {
      if (isMockMode()) return mockBackend.cancelOrder(id);
      return authedApi.post<{ order: Order }>(`/orders/${id}/cancel`);
    },
  },
  admin: {
    async analytics(): Promise<AdminAnalyticsResponse> {
      if (isMockMode()) return adminMockBackend.getAnalytics();
      return authedApi.get<AdminAnalyticsResponse>('/admin/analytics');
    },
    products: {
      async list(query: AdminProductListQuery = {}): Promise<AdminProductsResponse> {
        if (isMockMode()) return adminMockBackend.listProducts(query);
        return authedApi.get<AdminProductsResponse>('/admin/products', {
          query: query as QueryRecord,
        });
      },
      async get(id: string): Promise<{ product: Product }> {
        if (isMockMode()) return adminMockBackend.getProduct(id);
        return authedApi.get<{ product: Product }>(`/admin/products/${id}`);
      },
      async create(input: AdminUpsertProductInput): Promise<{ product: Product }> {
        if (isMockMode()) return adminMockBackend.createProduct(input);
        const result = await authedApi.post<{ product: Product }>('/catalog/admin/products', input);
        await revalidateStorefrontAfterCatalogChange();
        return result;
      },
      async update(
        id: string,
        input: Partial<AdminUpsertProductInput>,
      ): Promise<{ product: Product }> {
        if (isMockMode()) return adminMockBackend.updateProduct(id, input);
        const result = await authedApi.patch<{ product: Product }>(
          `/catalog/admin/products/${id}`,
          input,
        );
        await revalidateStorefrontAfterCatalogChange();
        return result;
      },
      async remove(id: string): Promise<void> {
        if (isMockMode()) return adminMockBackend.deleteProduct(id);
        await authedApi.delete<void>(`/catalog/admin/products/${id}`);
        await revalidateStorefrontAfterCatalogChange();
      },
    },
    categories: {
      async list(): Promise<{ items: AdminCategoryListItem[] }> {
        if (isMockMode()) return adminMockBackend.listCategories();
        return authedApi.get<{ items: AdminCategoryListItem[] }>('/admin/categories');
      },
      async create(input: AdminUpsertCategoryInput): Promise<{ category: Category }> {
        if (isMockMode()) return adminMockBackend.createCategory(input);
        const result = await authedApi.post<{ category: Category }>(
          '/catalog/admin/categories',
          input,
        );
        await revalidateStorefrontAfterCatalogChange();
        return result;
      },
      async update(
        id: string,
        input: Partial<AdminUpsertCategoryInput>,
      ): Promise<{ category: Category }> {
        if (isMockMode()) return adminMockBackend.updateCategory(id, input);
        const result = await authedApi.patch<{ category: Category }>(
          `/catalog/admin/categories/${id}`,
          input,
        );
        await revalidateStorefrontAfterCatalogChange();
        return result;
      },
      async remove(id: string): Promise<void> {
        if (isMockMode()) return adminMockBackend.deleteCategory(id);
        await authedApi.delete<void>(`/catalog/admin/categories/${id}`);
        await revalidateStorefrontAfterCatalogChange();
      },
    },
    brands: {
      async list(): Promise<{ items: AdminBrandListItem[] }> {
        if (isMockMode()) return adminMockBackend.listBrands();
        return authedApi.get<{ items: AdminBrandListItem[] }>('/admin/brands');
      },
      async create(input: AdminUpsertBrandInput): Promise<{ brand: Brand }> {
        if (isMockMode()) return adminMockBackend.createBrand(input);
        const result = await authedApi.post<{ brand: Brand }>('/catalog/admin/brands', input);
        await revalidateStorefrontAfterCatalogChange();
        return result;
      },
      async update(id: string, input: Partial<AdminUpsertBrandInput>): Promise<{ brand: Brand }> {
        if (isMockMode()) return adminMockBackend.updateBrand(id, input);
        const result = await authedApi.patch<{ brand: Brand }>(
          `/catalog/admin/brands/${id}`,
          input,
        );
        await revalidateStorefrontAfterCatalogChange();
        return result;
      },
      async remove(id: string): Promise<void> {
        if (isMockMode()) return adminMockBackend.deleteBrand(id);
        await authedApi.delete<void>(`/catalog/admin/brands/${id}`);
        await revalidateStorefrontAfterCatalogChange();
      },
    },
    orders: {
      async list(query: AdminOrderListQuery = {}): Promise<AdminOrdersResponse> {
        if (isMockMode()) return adminMockBackend.listOrders(query);
        return authedApi.get<AdminOrdersResponse>('/orders/admin/all', {
          query: query as QueryRecord,
        });
      },
      async get(id: string): Promise<{
        order: Order;
        customer?: { firstName: string; lastName: string; email: string; id: string } | undefined;
      }> {
        if (isMockMode()) {
          const res = await adminMockBackend.getOrder(id);
          return {
            order: res.order,
            customer: res.customer
              ? {
                  id: res.customer.id,
                  firstName: res.customer.firstName,
                  lastName: res.customer.lastName,
                  email: res.customer.email,
                }
              : undefined,
          };
        }
        return authedApi.get<{
          order: Order;
          customer?: { id: string; firstName: string; lastName: string; email: string };
        }>(`/orders/admin/all/${id}`);
      },
      async update(id: string, input: AdminOrderUpdateInput): Promise<{ order: Order }> {
        if (isMockMode()) return adminMockBackend.updateOrder(id, input);
        return authedApi.patch<{ order: Order }>(`/orders/admin/all/${id}`, input);
      },
      async refund(id: string, input: AdminRefundInput): Promise<{ order: Order }> {
        if (isMockMode()) return adminMockBackend.refundOrder(id, input);
        return authedApi.post<{ order: Order }>(`/orders/admin/all/${id}/refund`, input);
      },
    },
    coupons: {
      async list(query: AdminCouponListQuery = {}): Promise<AdminCouponsResponse> {
        if (isMockMode()) return adminMockBackend.listCoupons(query);
        return authedApi.get<AdminCouponsResponse>('/coupons/admin', {
          query: query as QueryRecord,
        });
      },
      async get(id: string): Promise<{ coupon: Coupon }> {
        if (isMockMode()) return adminMockBackend.getCoupon(id);
        return authedApi.get<{ coupon: Coupon }>(`/coupons/admin/${id}`);
      },
      async create(input: AdminUpsertCouponInput): Promise<{ coupon: Coupon }> {
        if (isMockMode()) return adminMockBackend.createCoupon(input);
        return authedApi.post<{ coupon: Coupon }>('/coupons/admin', input);
      },
      async update(
        id: string,
        input: Partial<AdminUpsertCouponInput>,
      ): Promise<{ coupon: Coupon }> {
        if (isMockMode()) return adminMockBackend.updateCoupon(id, input);
        return authedApi.patch<{ coupon: Coupon }>(`/coupons/admin/${id}`, input);
      },
      async remove(id: string): Promise<void> {
        if (isMockMode()) return adminMockBackend.deleteCoupon(id);
        await authedApi.delete<void>(`/coupons/admin/${id}`);
      },
    },
    reviews: {
      async list(query: AdminReviewListQuery = {}): Promise<AdminReviewsResponse> {
        if (isMockMode()) return adminMockBackend.listReviews(query);
        return authedApi.get<AdminReviewsResponse>('/reviews/admin', {
          query: query as QueryRecord,
        });
      },
      async moderate(id: string, input: AdminModerateReviewInput): Promise<{ review: Review }> {
        if (isMockMode()) return adminMockBackend.moderateReview(id, input);
        return authedApi.post<{ review: Review }>(`/reviews/admin/${id}/moderate`, input);
      },
      async remove(id: string): Promise<void> {
        if (isMockMode()) return adminMockBackend.deleteReview(id);
        await authedApi.delete<void>(`/reviews/admin/${id}`);
      },
    },
    customers: {
      async list(query: AdminCustomerListQuery = {}): Promise<AdminCustomersResponse> {
        if (isMockMode()) return adminMockBackend.listCustomers(query);
        return authedApi.get<AdminCustomersResponse>('/admin/customers', {
          query: query as QueryRecord,
        });
      },
      async get(id: string): Promise<{ customer: AdminCustomerDetail }> {
        if (isMockMode()) return adminMockBackend.getCustomer(id);
        return authedApi.get<{ customer: AdminCustomerDetail }>(`/admin/customers/${id}`);
      },
      async update(
        id: string,
        input: AdminUpdateCustomerInput,
      ): Promise<{ customer: AdminCustomerListItem }> {
        if (isMockMode()) return adminMockBackend.updateCustomer(id, input);
        return authedApi.patch<{ customer: AdminCustomerListItem }>(
          `/admin/customers/${id}`,
          input,
        );
      },
    },
    audit: {
      async list(query: AdminAuditListQuery = {}): Promise<AdminAuditResponse> {
        if (isMockMode()) return adminMockBackend.listAudit(query);
        return authedApi.get<AdminAuditResponse>('/admin/audit', { query: query as QueryRecord });
      },
    },
  },
  wishlist: {
    async list(): Promise<WishlistResponse> {
      if (isMockMode()) return mockBackend.getWishlist();
      return authedApi.get<WishlistResponse>('/wishlist');
    },
    async add(productId: string): Promise<{ productId: string }> {
      if (isMockMode()) return mockBackend.addWishlistItem(productId);
      return authedApi.post<{ productId: string }>('/wishlist/items', { productId });
    },
    async remove(productId: string): Promise<void> {
      if (isMockMode()) return mockBackend.removeWishlistItem(productId);
      await authedApi.delete<void>(`/wishlist/items/${productId}`);
    },
    async clear(): Promise<void> {
      if (isMockMode()) return mockBackend.clearWishlist();
      await authedApi.delete<void>('/wishlist');
    },
    async recentlyViewed(): Promise<RecentlyViewedResponse> {
      if (isMockMode()) return mockBackend.recentlyViewed();
      return authedApi.get<RecentlyViewedResponse>('/wishlist/recently-viewed');
    },
    async trackView(productId: string): Promise<void> {
      if (isMockMode()) return mockBackend.trackView(productId);
      await authedApi.post<void>('/wishlist/recently-viewed/track', { productId });
    },
  },
};

export type { AuthSession, OrderListResponse, WishlistResponse } from './types';
export { MockApiError };
