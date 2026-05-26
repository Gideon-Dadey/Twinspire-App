import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SettingsPanel } from '@/components/admin/settings-panel';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Storefront-wide configuration and tooling. Most of these become server-side feature flags in Phase 11."
        breadcrumb={[{ label: 'Settings' }]}
      />
      <SettingsPanel />
    </>
  );
}
