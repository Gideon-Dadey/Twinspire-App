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

const NAV_ITEMS: NavItem[] = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/payment-methods', label: 'Payment methods', icon: CreditCard },
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/security', label: 'Security', icon: ShieldCheck },
  { href: '/account/preferences', label: 'Preferences', icon: Settings },
];

function initials(name?: string): string {
  if (!name) return 'TS';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'TS';
}

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const signOut = useAuthStore((s) => s.signOut);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  const displayName = user
    ? user.displayName ?? `${user.firstName} ${user.lastName}`
    : 'Guest';

  return (
    <aside className="lg:sticky lg:top-32 lg:h-fit">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        {user?.loyaltyPoints ? (
          <div className="mt-4 rounded-lg bg-primary/5 px-3 py-2 text-xs">
            <p className="font-medium text-primary">{user.loyaltyPoints.toLocaleString()} reward points</p>
            <p className="text-muted-foreground">Redeem at checkout.</p>
          </div>
        ) : null}
      </div>

      <nav className="mt-4 rounded-2xl border border-border bg-card p-2" aria-label="Account">
        <ul className="grid gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/account' && pathname.startsWith(`${item.href}/`));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
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
      </nav>

      <div className="mt-4">
        <Button
          variant="ghost"
          fullWidth
          onClick={() => {
            void handleSignOut();
          }}
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
