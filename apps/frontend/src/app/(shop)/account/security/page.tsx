import type { Metadata } from 'next';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { ChangePasswordForm } from '@/components/account/change-password-form';
import { SessionsCard } from '@/components/account/sessions-card';
import { TwoFactorCard } from '@/components/account/two-factor-card';

export const metadata: Metadata = {
  title: 'Security',
  description: 'Manage password, two-factor authentication, and active sessions.',
  robots: { index: false, follow: false },
};

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Security"
        description="Strengthen your account with a unique password and two-factor authentication."
      />
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-display font-semibold tracking-tight">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You will be signed out of every device after updating your password.
        </p>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </section>
      <TwoFactorCard />
      <SessionsCard />
    </div>
  );
}
