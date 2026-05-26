'use client';

import type { Image as ImageData } from '@twinspire/types';
import { cn } from '@twinspire/ui';
import Image from 'next/image';
import * as React from 'react';

export interface ProductGalleryProps {
  images: ImageData[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps): React.JSX.Element {
  const safeImages = images.length > 0 ? images : [{ url: '', alt: productName }];
  const [active, setActive] = React.useState(0);

  return (
    <div className="grid gap-4">
      <div className="relative aspect-product overflow-hidden rounded-2xl border border-border bg-muted">
        {safeImages[active]?.url ? (
          <Image
            src={safeImages[active].url}
            alt={safeImages[active].alt ?? productName}
            fill
            sizes="(min-width: 1024px) 540px, 100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {safeImages.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {safeImages.map((img, idx) => (
            <li key={`${img.url}-${idx}`}>
              <button
                type="button"
                onClick={() => setActive(idx)}
                aria-label={`Show image ${idx + 1}`}
                aria-current={idx === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-lg border bg-muted transition-colors',
                  idx === active
                    ? 'border-primary ring-1 ring-primary/40'
                    : 'border-border hover:border-foreground/30',
                )}
              >
                {img.url && (
                  <Image
                    src={img.url}
                    alt={img.alt ?? productName}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
