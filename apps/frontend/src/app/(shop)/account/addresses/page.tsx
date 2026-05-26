import type { Metadata } from 'next';

import { AddressesPageContent } from '@/components/account/addresses-page-content';

export const metadata: Metadata = {
  title: 'Saved addresses',
  description: 'Manage shipping and billing addresses.',
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressesPageContent />;
}
