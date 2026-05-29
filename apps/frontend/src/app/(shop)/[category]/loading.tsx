import { Skeleton } from '@twinspire/ui';

import { ProductGridSkeleton } from '@/components/shop/product-grid';

export default function Loading() {
  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
