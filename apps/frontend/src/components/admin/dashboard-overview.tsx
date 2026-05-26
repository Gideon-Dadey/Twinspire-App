'use client';

import {
  Badge,
  Button,
  Money,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from '@twinspire/ui';
import { formatRelativeTime } from '@twinspire/utils';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Crown,
  DollarSign,
  Eye,
  PackageSearch,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useAdminAnalytics } from '@/lib/hooks/use-admin';

import { AreaChart, Donut, Sparkline } from './charts';
import { OrderStatusPill } from './order-status-pill';
import { StatCard } from './stat-card';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  awaiting_payment: '#e91b25',
  paid: '#0ea5e9',
  processing: '#6366f1',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  completed: '#059669',
  cancelled: '#9ca3af',
  refunded: '#ef4444',
  on_hold: '#eab308',
  failed: '#dc2626',
};

export function DashboardOverview() {
  const { data, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-lg lg:col-span-2" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-6 text-sm">
        <p className="text-destructive font-medium">Couldn’t load admin analytics.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue today"
          value={<Money value={summary.revenueToday} />}
          deltaPct={summary.revenueTodayDeltaPct}
          icon={DollarSign}
          trailing={
            <Sparkline
              data={summary.revenueSeries30d.slice(-14)}
              fill="currentColor"
              ariaLabel="Revenue last 14 days"
            />
          }
        />
        <StatCard
          label="Orders today"
          value={summary.ordersToday.toLocaleString()}
          deltaPct={summary.ordersTodayDeltaPct}
          icon={ShoppingBag}
          trailing={
            <Sparkline
              data={summary.ordersSeries30d.slice(-14)}
              fill="currentColor"
              ariaLabel="Orders last 14 days"
              className="text-sky-500"
            />
          }
        />
        <StatCard
          label="Avg. order value"
          value={<Money value={summary.averageOrderValue} />}
          deltaPct={summary.averageOrderValueDeltaPct}
          icon={TrendingUp}
        />
        <StatCard
          label="Active customers"
          value={summary.activeCustomers.toLocaleString()}
          deltaPct={summary.activeCustomersDeltaPct}
          icon={Users}
          description={`${summary.newSignupsWeek} new sign-ups this week`}
        />
      </div>

      <section className="border-border bg-card rounded-lg border p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Revenue & orders</h2>
            <p className="text-muted-foreground text-xs">Last 30 days, all channels.</p>
          </div>
          <Tabs defaultValue="revenue" className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="mt-4">
              <AreaChart
                data={summary.revenueSeries30d}
                formatValue={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toLocaleString()}`
                }
              />
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
              <AreaChart
                data={summary.ordersSeries30d}
                className="text-sky-500"
                formatValue={(v) => v.toLocaleString()}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="border-border bg-card rounded-lg border p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders" className="text-xs">
                View all
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </Button>
          </div>
          <ul className="mt-3 grid gap-2">
            {summary.recentOrders.map((order) => (
              <li
                key={order.id}
                className="border-border/60 bg-background grid items-center gap-3 rounded-lg border px-3 py-3 text-sm sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-foreground block truncate font-medium hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-muted-foreground truncate text-xs">
                    {order.items.length} items · {formatRelativeTime(order.placedAt)}
                  </p>
                </div>
                <OrderStatusPill status={order.status} />
                <Money value={order.totals.total} className="text-foreground text-sm font-medium" />
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  aria-label={`Open order ${order.orderNumber}`}
                >
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="size-4" aria-hidden />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="border-border bg-card rounded-lg border p-5">
            <h2 className="text-base font-semibold">Orders by status</h2>
            <div className="mt-4 flex items-center gap-5">
              <Donut
                size={140}
                segments={summary.ordersByStatus.map((s) => ({
                  id: s.status,
                  value: s.count,
                  color: STATUS_COLORS[s.status] ?? '#6366f1',
                }))}
                center={{
                  primary: summary.ordersByStatus.reduce((sum, s) => sum + s.count, 0).toString(),
                  secondary: 'Orders',
                }}
              />
              <ul className="grid flex-1 gap-1 text-xs">
                {summary.ordersByStatus.map((s) => (
                  <li key={s.status} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 truncate">
                      <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{ background: STATUS_COLORS[s.status] ?? '#6366f1' }}
                      />
                      <span className="capitalize">{s.status.replace(/_/g, ' ')}</span>
                    </span>
                    <span className="text-foreground font-medium">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-border bg-card rounded-lg border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Needs attention</h2>
            </div>
            <ul className="mt-3 grid gap-2 text-sm">
              <AlertRow
                icon={ShoppingBag}
                label={`${summary.pendingOrders} orders awaiting fulfilment`}
                href="/admin/orders?status=processing"
              />
              <AlertRow
                icon={AlertTriangle}
                label={`${summary.pendingReviews} reviews pending moderation`}
                href="/admin/reviews?status=pending"
              />
              <AlertRow
                icon={Boxes}
                label={`${summary.lowStockProducts} products low or out of stock`}
                href="/admin/products?lowStock=1"
              />
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-border bg-card rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Top products</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/products" className="text-xs">
                Manage
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </Button>
          </div>
          <ul className="mt-3 grid gap-2">
            {summary.topProducts.map((p, i) => (
              <li
                key={p.productId}
                className="border-border/60 bg-background flex items-center gap-3 rounded-lg border p-2 text-sm"
              >
                <span className="bg-primary/10 text-primary grid size-7 place-items-center rounded-md text-xs font-semibold">
                  {i + 1}
                </span>
                {p.image ? (
                  <span className="bg-muted relative h-12 w-12 overflow-hidden rounded-md">
                    <Image
                      src={p.image.url}
                      alt={p.image.alt ?? p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground grid size-12 place-items-center rounded-md">
                    <PackageSearch className="size-4" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-medium">{p.name}</p>
                  <p className="text-muted-foreground text-xs">{p.units} sold</p>
                </div>
                <Money value={p.revenue} className="text-sm font-medium" />
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border bg-card rounded-lg border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Top categories</h2>
            <Crown className="text-muted-foreground size-4" aria-hidden />
          </div>
          <ul className="mt-3 grid gap-3">
            {summary.topCategories.map((c) => (
              <li key={c.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{c.name}</span>
                  <Money value={c.revenue} className="text-muted-foreground" />
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={cn('bg-primary h-full rounded-full')}
                    style={{ width: `${Math.round(c.share * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-border bg-card rounded-lg border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent admin activity</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/audit" className="text-xs">
              View all
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </Button>
        </div>
        <ul className="mt-3 grid gap-2 text-sm">
          {summary.recentAudit.map((event) => (
            <li
              key={event.id}
              className="border-border/60 bg-background flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-foreground truncate">
                  <span className="font-medium">{event.actorName}</span>{' '}
                  <span className="text-muted-foreground">{prettifyAction(event.action)}</span>{' '}
                  {event.entityId ? (
                    <code className="text-muted-foreground text-xs">{event.entityId}</code>
                  ) : null}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatRelativeTime(event.createdAt)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {event.entity}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AlertRow({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof ShoppingBag;
  label: string;
  href: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="border-border/60 bg-background hover:bg-muted flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="text-muted-foreground size-4" aria-hidden />
          <span className="text-foreground">{label}</span>
        </span>
        <ArrowRight className="text-muted-foreground size-3.5" aria-hidden />
      </Link>
    </li>
  );
}

function prettifyAction(action: string): string {
  return action.replace(/\./g, ' · ').replace(/_/g, ' ');
}
