'use client';

import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@twinspire/ui';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { primaryNav, siteConfig, footerNav } from '@/lib/site-config';

export function MobileNav(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg xl:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0">
        <SheetHeader className="border-border border-b px-4 py-4 sm:px-6">
          <SheetTitle>{siteConfig.name}</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Mobile primary">
          <ul className="space-y-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-foreground hover:bg-muted flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium"
                >
                  {item.label}
                  {'highlight' in item && item.highlight && (
                    <span className="bg-accent text-accent-foreground rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      Hot
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="bg-border my-3 h-px" />
          <ul className="space-y-1">
            {footerNav.service.slice(0, 4).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-lg px-4 py-2 text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-border border-t p-4">
          <div className="flex gap-2">
            <Button asChild className="flex-1" onClick={() => setOpen(false)}>
              <Link href="/account">Sign in</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              <Link href="/account/register">Create account</Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
