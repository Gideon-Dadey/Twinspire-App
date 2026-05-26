'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import type { CreateAddressInput, UpdateAddressInput } from '@/lib/api/types';

export const addressKeys = {
  list: ['account', 'addresses'] as const,
};

export function useAddressesQuery() {
  return useQuery({
    queryKey: addressKeys.list,
    queryFn: () => api.users.listAddresses(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) => api.users.createAddress(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list });
      toast.success('Address added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not add address');
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; input: UpdateAddressInput }) =>
      api.users.updateAddress(params.id, params.input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list });
      toast.success('Address updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not update address');
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.users.deleteAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list });
      toast.success('Address removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not remove address');
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.users.setDefaultAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressKeys.list });
      toast.success('Default address updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not set default address');
    },
  });
}
