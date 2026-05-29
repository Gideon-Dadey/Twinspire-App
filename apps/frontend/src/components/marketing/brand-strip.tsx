import Image from 'next/image';
import Link from 'next/link';

import { getBrandStripBrands } from '@/data/brands';
import type { Brand } from '@twinspire/types';

function BrandLogo({ brand }: { brand: Brand }) {
  if (!brand.logo) {
    return (
      <span className="font-display text-center text-[11px] font-bold leading-tight tracking-tight text-neutral-800 sm:text-xs">
        {brand.name}
      </span>
    );
  }

  const isSvg = brand.logo.url.endsWith('.svg');

  if (isSvg) {
    return (
      <Image
        src={brand.logo.url}
        alt=""
        width={96}
        height={40}
        unoptimized
        className="h-auto max-h-10 w-full max-w-[88px] object-contain sm:max-h-11 sm:max-w-[92px]"
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={brand.logo.url}
      alt=""
      width={96}
      height={48}
      sizes="96px"
      className="max-h-10 max-w-[88px] object-contain sm:max-h-11 sm:max-w-[96px]"
      aria-hidden
    />
  );
}

function BrandTile({ brand, decorative }: { brand: Brand; decorative?: boolean }) {
  return (
    <li className="shrink-0">
      <Link
        href={`/brands/${brand.slug}`}
        tabIndex={decorative ? -1 : undefined}
        aria-hidden={decorative || undefined}
        className="group flex h-[88px] w-[88px] items-center justify-center border border-neutral-200 bg-white p-3 transition-[border-color,box-shadow] hover:border-neutral-300 hover:shadow-sm sm:h-[100px] sm:w-[100px] sm:p-4"
        aria-label={decorative ? undefined : brand.name}
      >
        <BrandLogo brand={brand} />
      </Link>
    </li>
  );
}

export function BrandStrip() {
  const brands = getBrandStripBrands();

  return (
    <section className="border-border bg-background border-y">
      <div className="container mx-auto px-3 py-10 sm:px-4 md:py-12">
        <div className="relative overflow-hidden motion-reduce:overflow-visible">
          <div
            aria-hidden
            className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent motion-reduce:hidden sm:w-16"
          />
          <div
            aria-hidden
            className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent motion-reduce:hidden sm:w-16"
          />

          <ul
            className="animate-marquee flex w-max gap-3 [animation-duration:40s] hover:[animation-play-state:paused] motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-4 sm:gap-4"
            aria-label="Featured brands"
          >
            {brands.map((brand) => (
              <BrandTile key={brand.id} brand={brand} />
            ))}
            {brands.map((brand) => (
              <BrandTile key={`${brand.id}-dup`} brand={brand} decorative />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
