'use client';

import { Avatar, AvatarFallback, AvatarImage, Button, cn } from '@twinspire/ui';
import {
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useSession } from '@/lib/hooks/use-session';
import { useAuthStore } from '@/lib/stores/auth-store';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/payment-methods', label: 'Payments', icon: CreditCard },
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/security', label: 'Security', icon: ShieldCheck },
  { href: '/account/preferences', label: 'Preferences', icon: Settings },
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

export function AccountMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const signOut = useAuthStore((s) => s.signOut);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const displayName = user ? (user.displayName ?? `${user.firstName} ${user.lastName}`) : 'Guest';

  return (
    <div className="space-y-3 lg:hidden">
      <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-3">
        <Avatar className="size-10 shrink-0">
          {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
          <AvatarFallback>{initials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">{displayName}</p>
          <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void handleSignOut();
          }}
          className="shrink-0"
          aria-label="Sign out"
        >
          <LogOut className="size-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Sign out</span>
        </Button>
      </div>

      <nav aria-label="Account">
        {/* Horizontal scroll-snap row. `scrollbar-none` (provided by the UI
            preset's plugin) hides the scrollbar without preventing the
            actual scroll. Each pill uses `snap-start` so flicking lands on
            the next tab cleanly. */}
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/account' && pathname.startsWith(`${item.href}/`));
            return (
              <li key={item.href} className="snap-start">
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
