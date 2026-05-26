import { cn } from '@twinspire/ui';
import { Heart } from 'lucide-react';
import Link from 'next/link';

import { primaryNav, siteConfig } from '@/lib/site-config';

import { AccountMenu } from './account-menu';
import { CartIcon } from './cart-icon';
import { MobileNav } from './mobile-nav';
import { SearchBar } from './search-bar';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex h-16 items-center gap-2 px-4 sm:gap-3 md:gap-4 xl:gap-6">
        <MobileNav />

        <Link
          href="/"
          aria-label={siteConfig.name}
          className="flex shrink-0 items-center gap-2"
        >
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground shadow-sm"
          >
            T
          </span>
          <span className="hidden font-display text-lg font-semibold tracking-tight sm:inline">
            {siteConfig.name}
          </span>
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" aria-hidden />
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
