import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AuditLog } from '@/components/admin/audit-log';

export const metadata: Metadata = {
  title: 'Audit log',
};

export default function AdminAuditPage() {
  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every meaningful action taken by staff. Useful for security reviews and compliance."
        breadcrumb={[{ label: 'Audit log' }]}
      />
      <AuditLog />
    </>
  );
}
