'use client';

import { faApple, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@twinspire/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';

// Apple & Google only — Facebook was dropped from the supported provider list.
// `iconColor` keeps each glyph in its canonical brand color (#000 for Apple,
// the Google chromatic "G" can't be done in a single fill so we use a neutral
// dark gray that reads well on both light and disabled-button states).
const PROVIDERS = [
  { id: 'google', label: 'Continue with Google', icon: faGoogle, iconColor: '#4285F4' },
  { id: 'apple', label: 'Continue with Apple', icon: faApple, iconColor: '#000000' },
] as const;

type ProviderId = (typeof PROVIDERS)[number]['id'];

interface SocialButtonsProps {
  redirectTo?: string;
}

export function SocialButtons({ redirectTo = '/account' }: SocialButtonsProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [pending, setPending] = useState<ProviderId | null>(null);

  async function handle(provider: ProviderId) {
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
          <FontAwesomeIcon
            icon={provider.icon}
            className="mr-2 h-4 w-4"
            style={{ color: provider.iconColor }}
            aria-hidden
          />
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
