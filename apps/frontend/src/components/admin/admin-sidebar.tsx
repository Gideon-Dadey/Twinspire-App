'use client';

import { Avatar, AvatarFallback, AvatarImage, Button, cn } from '@twinspire/ui';
import {
  BadgeCheck,
  Boxes,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import { useSession } from '@/lib/hooks/use-session';
import { useAuthStore } from '@/lib/stores/auth-store';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Boxes },
      { href: '/admin/brands', label: 'Brands', icon: BadgeCheck },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/coupons', label: 'Coupons', icon: Tag },
      { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareWarning },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/audit', label: 'Audit log', icon: History },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

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

function isItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/admin') return pathname === '/admin';
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const signOut = useAuthStore((s) => s.signOut);

  async function handleSignOut() {
    await signOut();
    router.push('/login?returnTo=%2Fadmin');
  }

  const displayName = user ? user.displayName ?? `${user.firstName} ${user.lastName}` : '';

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col gap-4 border-r border-border bg-card px-4 py-5 lg:w-[260px]',
        className,
      )}
    >
      <Link href="/admin" className="flex items-center gap-2 px-1 py-1 transition-opacity hover:opacity-90">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">TwinSpire</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Admin Console
          </p>
        </div>
      </Link>

      <nav aria-label="Admin" className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
        {NAV.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {section.label}
            </p>
            <ul className="grid gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
              {user?.role}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="flex-1 justify-center text-xs">
            <Link href="/account">
              <ClipboardList className="size-3.5" aria-hidden /> My account
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Sign out"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </aside>
  );
}
