'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';

export const sessionKeys = {
  list: ['account', 'sessions'] as const,
};

export function useSessionsQuery() {
  return useQuery({
    queryKey: sessionKeys.list,
    queryFn: () => api.auth.listSessions(),
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.auth.revokeSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKeys.list });
      toast.success('Session revoked');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not revoke session');
    },
  });
}
