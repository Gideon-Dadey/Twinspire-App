import type { Metadata } from 'next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ReviewsPageContent } from '@/components/admin/reviews-page-content';

export const metadata: Metadata = {
  title: 'Reviews',
};

export default function AdminReviewsPage() {
  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Moderate customer reviews. Approve quality feedback, reject spam, or flag suspicious activity."
        breadcrumb={[{ label: 'Reviews' }]}
      />
      <ReviewsPageContent />
    </>
  );
}
