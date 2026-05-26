import { Skeleton } from '@twinspire/ui';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-8 md:pt-12">
      <Skeleton className="mb-6 h-4 w-60" />
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <Skeleton className="aspect-product w-full rounded-2xl" />
        <div className="space-y-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-12 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
