'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import type { UpdatePreferencesInput, UpdateProfileInput } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';

export const profileKeys = {
  me: ['session', 'me'] as const,
};

export function useProfileQuery() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: () => api.auth.me(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.users.updateProfile(input),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(profileKeys.me, data);
      toast.success('Profile updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update profile');
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => api.users.updatePreferences(input),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(profileKeys.me, data);
      toast.success('Preferences saved');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save preferences');
    },
  });
}
