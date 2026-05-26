import * as React from 'react';

import { AspectRatio } from '../components/aspect-ratio';
import { Card } from '../components/card';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/cn';

export type ProductCardSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function ProductCardSkeleton({
  className,
  ...props
}: ProductCardSkeletonProps): React.JSX.Element {
  return (
    <Card className={cn('flex h-full flex-col overflow-hidden rounded-lg', className)} {...props}>
      <AspectRatio ratio={1} className="bg-muted overflow-hidden p-4">
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <div className="border-border/60 flex flex-col gap-1.5 border-t px-3.5 pb-3.5 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-12" />
        </div>
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
        <div className="mt-1 flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </Card>
  );
}
