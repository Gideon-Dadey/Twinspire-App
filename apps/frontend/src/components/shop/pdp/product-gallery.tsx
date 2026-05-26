'use client';

import type { Image as ImageData } from '@twinspire/types';
import { cn } from '@twinspire/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

export interface ProductGalleryProps {
  images: ImageData[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps): React.JSX.Element {
  const safeImages = images.length > 0 ? images : [{ url: '', alt: productName }];
  const [active, setActive] = React.useState(0);
  const total = safeImages.length;

  const goPrev = React.useCallback(() => {
    setActive((idx) => (idx - 1 + total) % total);
  }, [total]);

  const goNext = React.useCallback(() => {
    setActive((idx) => (idx + 1) % total);
  }, [total]);

  React.useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  const currentImage = safeImages[active];

  return (
    <div className="mx-auto grid w-full max-w-[520px] gap-3 lg:mx-0">
      <div className="group/gallery relative aspect-square overflow-hidden rounded-lg border border-border bg-white p-6 sm:p-8">
        {currentImage?.url ? (
          <Image
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.alt ?? productName}
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            priority
            className="object-contain transition-opacity duration-moderate ease-out"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <span className="text-xs">No image</span>
          </div>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className={cn(
                'absolute left-3 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur transition-all',
                'opacity-0 hover:bg-background group-hover/gallery:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              )}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className={cn(
                'absolute right-3 top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur transition-all',
                'opacity-0 hover:bg-background group-hover/gallery:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              )}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>

            <div
              aria-hidden
              className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur"
            >
              {active + 1} / {total}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <ul
          className="grid grid-cols-5 gap-2 sm:gap-2.5"
          role="tablist"
          aria-label="Product images"
        >
          {safeImages.slice(0, 5).map((img, idx) => (
            <li key={`${img.url}-${idx}`}>
              <button
                type="button"
                role="tab"
                onClick={() => setActive(idx)}
                aria-label={`Show image ${idx + 1} of ${total}`}
                aria-selected={idx === active}
                className={cn(
                  'relative block aspect-square w-full overflow-hidden rounded-lg border bg-white p-1.5 transition-colors',
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
                    sizes="80px"
                    className="object-contain"
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
