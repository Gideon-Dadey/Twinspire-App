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
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <OrDivider />
      <SocialButtons />
    </AuthCard>
  );
}
