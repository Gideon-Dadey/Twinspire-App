import type { Metadata } from 'next';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { PreferencesForm } from '@/components/account/preferences-form';

export const metadata: Metadata = {
  title: 'Preferences',
  description: 'Configure your locale, currency, and notification preferences.',
  robots: { index: false, follow: false },
};

export default function PreferencesPage() {
  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Preferences"
        description="Tune TwinSpire to your locale, currency, and how often we contact you."
      />
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <PreferencesForm />
      </section>
    </div>
  );
}
