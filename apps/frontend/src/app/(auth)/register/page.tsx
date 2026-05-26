import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { OrDivider } from '@/components/auth/or-divider';
import { RegisterForm } from '@/components/auth/register-form';
import { SocialButtons } from '@/components/auth/social-buttons';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create a TwinSpire account.',
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <AuthCard
      eyebrow="New here?"
      title="Create your TwinSpire account"
      description="Track orders, save addresses, and pick up where you left off."
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
      <OrDivider />
      <SocialButtons />
    </AuthCard>
  );
}
