'use client';

import { useSession } from '@/lib/hooks/use-session';

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Late nights, dedication';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Up late';
}

export function DashboardGreeting() {
  const { user } = useSession();
  const greeting = timeOfDayGreeting();
  const name = user?.firstName ?? 'there';
  return (
    <header className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{greeting}</p>
      <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground sm:text-3xl">
        Welcome back, {name}
      </h1>
      <p className="text-sm text-muted-foreground">
        Manage your orders, addresses, wishlist, and security — all from one place.
      </p>
    </header>
  );
}
