'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@twinspire/ui';
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  User,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from '@/lib/hooks/use-session';
import { useAuthStore } from '@/lib/stores/auth-store';

function initials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'TS'
  );
}

export function AccountMenu() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useSession();
  const signOut = useAuthStore((s) => s.signOut);

  if (!hasHydrated) {
    return (
      <Link
        href="/login"
        className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Account"
      >
        <User className="h-5 w-5" aria-hidden />
      </Link>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <User className="h-5 w-5" aria-hidden />
      </Link>
    );
  }

  const displayName = user.displayName ?? `${user.firstName} ${user.lastName}`;
  const isStaff = ['admin', 'superadmin', 'manager', 'staff', 'support'].includes(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted"
        aria-label="Account menu"
      >
        <Avatar className="size-9">
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
          <AvatarFallback>{initials(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserRound className="size-4" aria-hidden /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/orders">
              <Package className="size-4" aria-hidden /> Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/wishlist">
              <Heart className="size-4" aria-hidden /> Wishlist
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/addresses">
              <MapPin className="size-4" aria-hidden /> Addresses
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/security">
              <ShieldCheck className="size-4" aria-hidden /> Security
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isStaff ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <LayoutDashboard className="size-4" aria-hidden /> Admin console
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut().then(() => router.push('/'));
          }}
        >
          <LogOut className="size-4" aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
