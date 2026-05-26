import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Set a new password',
  description: 'Choose a new TwinSpire password.',
  robots: { index: false, follow: true },
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      eyebrow="Almost done"
      title="Set a new password"
      description="Choose a strong password — at least 12 characters with mixed case, numbers, and symbols."
      footer={
        <p>
          Back to{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
