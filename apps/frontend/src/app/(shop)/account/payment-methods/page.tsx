import type { Metadata } from 'next';

import { AccountPageHeader } from '@/components/account/account-page-header';

export const metadata: Metadata = {
  title: 'Payment methods',
  description: 'Manage saved payment methods.',
  robots: { index: false, follow: false },
};

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Payment methods"
        description="Save cards for faster checkout. Wallet integration lands in Phase 8."
      />
      <section className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm font-semibold text-foreground">
          Stored payment methods arrive with the Stripe integration in Phase 8.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          For now, enter card details directly at checkout. Existing orders will appear under
          Orders.
        </p>
      </section>
    </div>
  );
}
