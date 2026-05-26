'use client';

import type { PublicUser } from '@twinspire/types';
import { create } from 'zustand';

import { api } from '@/lib/api';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: PublicUser | null;
  hasHydrated: boolean;
}

interface AuthActions {
  setUser: (user: PublicUser | null) => void;
  bootstrap: () => Promise<void>;
  signOut: (everywhere?: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  status: 'idle',
  user: null,
  hasHydrated: false,
  setUser: (user) => {
    set({ user, status: user ? 'authenticated' : 'unauthenticated' });
  },
  bootstrap: async () => {
    if (get().hasHydrated) return;
    set({ status: 'loading' });
    try {
      const { user } = await api.auth.me();
      set({ user, status: 'authenticated', hasHydrated: true });
    } catch {
      set({ user: null, status: 'unauthenticated', hasHydrated: true });
    }
  },
  signOut: async (everywhere = false) => {
    try {
      await api.auth.logout(everywhere);
    } finally {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));

export function selectIsAuthenticated(state: AuthState): boolean {
  return state.status === 'authenticated' && state.user !== null;
}

export function selectUser(state: AuthState): PublicUser | null {
  return state.user;
}
