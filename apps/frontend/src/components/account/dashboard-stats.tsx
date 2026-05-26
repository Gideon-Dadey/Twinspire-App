'use client';

import { Money, Skeleton } from '@twinspire/ui';
import { Heart, MapPin, Package, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { useAddressesQuery } from '@/lib/hooks/use-addresses';
import { useOrdersQuery } from '@/lib/hooks/use-orders';
import { useWishlistQuery } from '@/lib/hooks/use-wishlist';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  description?: string;
}

function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-border bg-card p-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-2xl font-display font-semibold text-foreground">{value}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <span aria-hidden className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="size-5" />
      </span>
    </div>
  );
}

export function DashboardStats() {
  const orders = useOrdersQuery({ perPage: 50 });
  const wishlist = useWishlistQuery();
  const addresses = useAddressesQuery();

  const isLoading = orders.isLoading || wishlist.isLoading || addresses.isLoading;
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const totalOrders = orders.data?.total ?? 0;
  const lifetimeSpend = orders.data?.items.reduce((sum, o) => sum + o.total.amount, 0) ?? 0;
  const currency = orders.data?.items[0]?.total.currency ?? 'USD';
  const wishlistCount = wishlist.data?.total ?? 0;
  const addressCount = addresses.data?.addresses.length ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Orders" value={totalOrders} icon={Package} description="Lifetime orders placed" />
      <StatCard
        label="Lifetime spend"
        value={<Money value={{ amount: lifetimeSpend, currency }} />}
        icon={Sparkles}
        description="Across all completed orders"
      />
      <StatCard label="Wishlist" value={wishlistCount} icon={Heart} description="Saved for later" />
      <StatCard label="Addresses" value={addressCount} icon={MapPin} description="Shipping & billing" />
    </div>
  );
}
