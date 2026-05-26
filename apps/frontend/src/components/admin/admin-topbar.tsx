'use client';

import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Input, Sheet, SheetContent, SheetTrigger, cn } from '@twinspire/ui';
import { Bell, Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useSession } from '@/lib/hooks/use-session';

import { AdminSidebar } from './admin-sidebar';

function initials(name?: string): string {
  if (!name) return 'TS';
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'TS'
  );
}

export function AdminTopbar({ className }: { className?: string }) {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const displayName = user ? user.displayName ?? `${user.firstName} ${user.lastName}` : '';

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-6',
        className,
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-4" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <AdminSidebar className="w-full border-r-0" />
        </SheetContent>
      </Sheet>

      <div className="relative hidden flex-1 max-w-md md:flex">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          aria-label="Search orders, products, customers"
          placeholder="Search orders, products, customers… (⌘K)"
          className="pl-9"
          readOnly
          onFocus={(e) => e.currentTarget.blur()}
        />
      </div>

      <div className="flex items-center gap-2 md:ml-auto md:flex-none">
        <Badge variant="outline" className="hidden h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] uppercase tracking-wide sm:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
          All systems operational
        </Badge>

        <Button variant="ghost" size="icon" aria-label="View notifications">
          <Bell className="size-4" aria-hidden />
        </Button>

        <Link href="/account" className="flex items-center gap-2 rounded-full border border-border bg-card px-1 py-1 pr-3 text-sm transition-colors hover:bg-muted">
          <Avatar className="size-7">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium text-foreground sm:inline">{displayName}</span>
        </Link>
      </div>
    </header>
  );
}
