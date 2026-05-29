import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@twinspire/ui';
import Image from 'next/image';
import Link from 'next/link';

import { primaryNav, siteConfig } from '@/lib/site-config';

import { AccountMenu } from './account-menu';
import { CartIcon } from './cart-icon';
import { MobileNav } from './mobile-nav';
import { SearchBar } from './search-bar';

export function SiteHeader() {
  return (
    // `isolate` creates a brand-new stacking context for the header, so any
    // descendant `z-*` inside cards/badges/etc. can never poke through.
    // `z-sticky` (1100) sits well above every page-level layer; the explicit
    // `z-50` fallback is there in case a downstream Tailwind config strips
    // the custom token. Background bumped from /90 to /95 + a hard fallback
    // so content can't bleed visually through the blur during fast scrolls.
    <header className="z-sticky border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 isolate border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-4 md:gap-4 xl:gap-6">
        <MobileNav />

        <Link href="/" aria-label={siteConfig.name} className="flex shrink-0 items-center">
          {/*
           * Logo lockup ships at native 1280×426 (~3:1). We render at a fixed
           * 40px height; Next/Image keeps the natural aspect by computing
           * width from the intrinsic ratio (≈120px). `priority` so the LCP
           * paints without waiting on hydration.
           */}
          <Image
            src="/twinspire-logo.png"
            alt={siteConfig.name}
            width={1280}
            height={426}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 xl:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'inline-flex h-10 items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors',
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'highlight' in item && item.highlight && 'text-accent hover:text-accent',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <SearchBar className="hidden min-w-0 flex-1 md:flex md:max-w-xs xl:max-w-[18rem]" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <AccountMenu />
          <Link
            href="/wishlist"
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            aria-label="Wishlist"
          >
            <FontAwesomeIcon icon={faHeart} className="h-[18px] w-[18px]" aria-hidden />
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
