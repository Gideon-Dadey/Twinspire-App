import * as React from 'react';

import { AspectRatio } from '../components/aspect-ratio';
import { Card } from '../components/card';
import { Skeleton } from '../components/skeleton';
import { cn } from '../lib/cn';

export type ProductCardSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function ProductCardSkeleton({ className, ...props }: ProductCardSkeletonProps): React.JSX.Element {
  return (
    <Card className={cn('flex h-full flex-col overflow-hidden rounded-2xl', className)} {...props}>
      <AspectRatio ratio={4 / 5} className="overflow-hidden bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
      </AspectRatio>
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <div className="mt-2 flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-8 w-full rounded-lg" />
      </div>
    </Card>
  );
}
