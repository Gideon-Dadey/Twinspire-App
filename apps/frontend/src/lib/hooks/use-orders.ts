'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { OrderStatus } from '@twinspire/types';

import { api } from '@/lib/api';

export interface OrdersQueryOptions {
  page?: number;
  perPage?: number;
  status?: OrderStatus;
}

export const orderKeys = {
  list: (options: OrdersQueryOptions) => ['account', 'orders', options] as const,
  detail: (id: string) => ['account', 'orders', 'detail', id] as const,
};

export function useOrdersQuery(options: OrdersQueryOptions = {}) {
  return useQuery({
    queryKey: orderKeys.list(options),
    queryFn: () => api.orders.list(options),
    placeholderData: (previous) => previous,
  });
}

export function useOrderQuery(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Order id is required');
      return api.orders.get(id);
    },
    enabled: Boolean(id),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.orders.cancel(id),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['account', 'orders'] });
      queryClient.setQueryData(orderKeys.detail(result.order.id), result);
      toast.success(`Order ${result.order.orderNumber} cancelled`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not cancel order');
    },
  });
}
