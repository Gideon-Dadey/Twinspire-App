import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your TwinSpire password.',
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter the email on your account and we'll send you a secure reset link."
      footer={
        <p>
          Remembered your password?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
