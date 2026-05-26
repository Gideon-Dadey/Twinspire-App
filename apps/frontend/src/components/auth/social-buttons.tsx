'use client';

import { Button } from '@twinspire/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';

const PROVIDERS = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'facebook', label: 'Continue with Facebook' },
  { id: 'apple', label: 'Continue with Apple' },
] as const;

interface SocialButtonsProps {
  redirectTo?: string;
}

export function SocialButtons({ redirectTo = '/account' }: SocialButtonsProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [pending, setPending] = useState<string | null>(null);

  async function handle(provider: 'google' | 'facebook' | 'apple') {
    setPending(provider);
    try {
      const result = await api.auth.socialLogin({
        provider,
        idToken: `mock-${provider}-token-${Date.now()}`,
      });
      setUser(result.user);
      toast.success(`Signed in with ${provider}`);
      router.push(redirectTo);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message ?? `Could not sign in with ${provider}`);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid gap-2">
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          fullWidth
          loading={pending === provider.id}
          disabled={pending !== null}
          onClick={() => {
            void handle(provider.id);
          }}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
