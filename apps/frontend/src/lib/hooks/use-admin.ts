'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import type {
  AdminAuditListQuery,
  AdminCouponListQuery,
  AdminCustomerListQuery,
  AdminModerateReviewInput,
  AdminOrderListQuery,
  AdminOrderUpdateInput,
  AdminProductListQuery,
  AdminRefundInput,
  AdminReviewListQuery,
  AdminUpdateCustomerInput,
  AdminUpsertBrandInput,
  AdminUpsertCategoryInput,
  AdminUpsertCouponInput,
  AdminUpsertProductInput,
} from '@/lib/api/admin-types';

export const adminKeys = {
  all: ['admin'] as const,
  analytics: () => ['admin', 'analytics'] as const,
  products: (query: AdminProductListQuery) => ['admin', 'products', query] as const,
  product: (id: string) => ['admin', 'products', id] as const,
  categories: () => ['admin', 'categories'] as const,
  brands: () => ['admin', 'brands'] as const,
  orders: (query: AdminOrderListQuery) => ['admin', 'orders', query] as const,
  order: (id: string) => ['admin', 'orders', id] as const,
  coupons: (query: AdminCouponListQuery) => ['admin', 'coupons', query] as const,
  coupon: (id: string) => ['admin', 'coupons', id] as const,
  reviews: (query: AdminReviewListQuery) => ['admin', 'reviews', query] as const,
  customers: (query: AdminCustomerListQuery) => ['admin', 'customers', query] as const,
  customer: (id: string) => ['admin', 'customers', id] as const,
  audit: (query: AdminAuditListQuery) => ['admin', 'audit', query] as const,
};

function withToast<T extends { message?: string }>(
  message: string,
  fn: (err: Error & T) => void = () => undefined,
) {
  return (err: Error & T) => {
    toast.error(err?.message ?? message);
    fn(err);
  };
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                  */
/* -------------------------------------------------------------------------- */

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: () => api.admin.analytics(),
    staleTime: 30_000,
  });
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export function useAdminProducts(query: AdminProductListQuery = {}) {
  return useQuery({
    queryKey: adminKeys.products(query),
    queryFn: () => api.admin.products.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.product(id ?? ''),
    queryFn: () => api.admin.products.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useCreateAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUpsertProductInput) => api.admin.products.create(input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(`Product “${data.product.name}” created`);
    },
    onError: withToast('Could not create product'),
  });
}

export function useUpdateAdminProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AdminUpsertProductInput>) => api.admin.products.update(id, input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.setQueryData(adminKeys.product(id), data);
      toast.success('Product saved');
    },
    onError: withToast('Could not update product'),
  });
}

export function useDeleteAdminProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.products.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted');
    },
    onError: withToast('Could not delete product'),
  });
}

/* -------------------------------------------------------------------------- */
/* Categories + Brands                                                        */
/* -------------------------------------------------------------------------- */

export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: () => api.admin.categories.list(),
  });
}

export function useCreateAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUpsertCategoryInput) => api.admin.categories.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.categories() });
      toast.success('Category created');
    },
    onError: withToast('Could not create category'),
  });
}

export function useUpdateAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: Partial<AdminUpsertCategoryInput> }) =>
      api.admin.categories.update(vars.id, vars.input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.categories() });
      toast.success('Category updated');
    },
    onError: withToast('Could not update category'),
  });
}

export function useDeleteAdminCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.categories.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.categories() });
      toast.success('Category removed');
    },
    onError: withToast('Could not delete category'),
  });
}

export function useAdminBrands() {
  return useQuery({
    queryKey: adminKeys.brands(),
    queryFn: () => api.admin.brands.list(),
  });
}

export function useCreateAdminBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUpsertBrandInput) => api.admin.brands.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.brands() });
      toast.success('Brand created');
    },
    onError: withToast('Could not create brand'),
  });
}

export function useUpdateAdminBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: Partial<AdminUpsertBrandInput> }) =>
      api.admin.brands.update(vars.id, vars.input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.brands() });
      toast.success('Brand updated');
    },
    onError: withToast('Could not update brand'),
  });
}

export function useDeleteAdminBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.brands.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.brands() });
      toast.success('Brand removed');
    },
    onError: withToast('Could not delete brand'),
  });
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export function useAdminOrders(query: AdminOrderListQuery = {}) {
  return useQuery({
    queryKey: adminKeys.orders(query),
    queryFn: () => api.admin.orders.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.order(id ?? ''),
    queryFn: () => api.admin.orders.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminOrderUpdateInput) => api.admin.orders.update(id, input),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.order(id), { order: data.order });
      void qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success(`Order ${data.order.orderNumber} updated`);
    },
    onError: withToast('Could not update order'),
  });
}

export function useRefundAdminOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminRefundInput) => api.admin.orders.refund(id, input),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.order(id), { order: data.order });
      void qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success(`Refunded order ${data.order.orderNumber}`);
    },
    onError: withToast('Could not refund order'),
  });
}

/* -------------------------------------------------------------------------- */
/* Coupons                                                                    */
/* -------------------------------------------------------------------------- */

export function useAdminCoupons(query: AdminCouponListQuery = {}) {
  return useQuery({
    queryKey: adminKeys.coupons(query),
    queryFn: () => api.admin.coupons.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useAdminCoupon(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.coupon(id ?? ''),
    queryFn: () => api.admin.coupons.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useCreateAdminCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUpsertCouponInput) => api.admin.coupons.create(input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success(`Coupon ${data.coupon.code} created`);
    },
    onError: withToast('Could not create coupon'),
  });
}

export function useUpdateAdminCoupon(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AdminUpsertCouponInput>) => api.admin.coupons.update(id, input),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.coupon(id), data);
      void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success(`Coupon ${data.coupon.code} updated`);
    },
    onError: withToast('Could not update coupon'),
  });
}

export function useDeleteAdminCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.coupons.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Coupon deleted');
    },
    onError: withToast('Could not delete coupon'),
  });
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                    */
/* -------------------------------------------------------------------------- */

export function useAdminReviews(query: AdminReviewListQuery = {}) {
  return useQuery({
    queryKey: adminKeys.reviews(query),
    queryFn: () => api.admin.reviews.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useModerateAdminReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: AdminModerateReviewInput }) =>
      api.admin.reviews.moderate(vars.id, vars.input),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success(`Review ${data.review.status}`);
    },
    onError: withToast('Could not update review'),
  });
}

export function useDeleteAdminReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.reviews.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast.success('Review deleted');
    },
    onError: withToast('Could not delete review'),
  });
}

/* -------------------------------------------------------------------------- */
/* Customers                                                                  */
/* -------------------------------------------------------------------------- */

export function useAdminCustomers(query: AdminCustomerListQuery = {}) {
  return useQuery({
    queryKey: adminKeys.customers(query),
    queryFn: () => api.admin.customers.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useAdminCustomer(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.customer(id ?? ''),
    queryFn: () => api.admin.customers.get(id ?? ''),
    enabled: Boolean(id),
  });
}

export function useUpdateAdminCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUpdateCustomerInput) => api.admin.customers.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      toast.success('Customer updated');
    },
    onError: withToast('Could not update customer'),
  });
}

/* -------------------------------------------------------------------------- */
/* Audit log                                                                  */
/* -------------------------------------------------------------------------- */

export function useAdminAudit(query: AdminAuditListQuery = {}) {
  return useQuery({
    queryKey: adminKeys.audit(query),
    queryFn: () => api.admin.audit.list(query),
    placeholderData: (previous) => previous,
  });
}
