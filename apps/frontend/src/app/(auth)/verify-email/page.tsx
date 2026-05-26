import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { VerifyEmailStatus } from '@/components/auth/verify-email-status';

export const metadata: Metadata = {
  title: 'Verify your email',
  description: 'Confirm your TwinSpire email address.',
  robots: { index: false, follow: true },
};

export default function VerifyEmailPage() {
  return (
    <AuthCard
      eyebrow="One last thing"
      title="Verifying your email"
      description="This will only take a moment."
    >
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthCard>
  );
}
