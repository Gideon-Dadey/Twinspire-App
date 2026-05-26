import type { Metadata } from 'next';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { ProfileForm } from '@/components/account/profile-form';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Update your name, avatar, and contact details.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Profile"
        description="Update the basics other shoppers and our shipping partners see."
      />
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <ProfileForm />
      </section>
    </div>
  );
}
