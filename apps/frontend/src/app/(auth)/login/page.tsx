import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';
import { OrDivider } from '@/components/auth/or-divider';
import { SocialButtons } from '@/components/auth/social-buttons';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your TwinSpire account.',
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to TwinSpire"
      description="Use your email and password, or continue with a social provider."
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
        <p className="font-semibold">Demo mode</p>
        <p className="text-muted-foreground">
          Use <code className="font-mono">demo@twinspire.dev</code> /{' '}
          <code className="font-mono">TwinSpire!2026</code> to sign in instantly.
        </p>
      </div>
      <Suspense fallback={null}>
        <div className="mt-4">
          <LoginForm />
        </div>
      </Suspense>
      <OrDivider />
      <SocialButtons />
    </AuthCard>
  );
}
