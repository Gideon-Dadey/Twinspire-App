import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb, Button } from '@twinspire/ui';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export const metadata: Metadata = {
  title: 'Order placed',
  description: 'Thank you for your TwinSpire order.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const orderNumber = sp.order ?? 'TS-DEMO';
  return (
    <div className="container mx-auto max-w-2xl px-4 pb-20 pt-8 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Order confirmation' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />

      <div className="rounded-lg border border-border bg-card p-8 text-center md:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" aria-hidden />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-muted-foreground">
          We've sent a confirmation to your inbox. You'll get another note as soon as your package
          ships.
        </p>

        <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4">
          <Package className="size-5 text-primary" aria-hidden />
          <div className="text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Order number
            </p>
            <p className="font-mono text-lg font-semibold">{orderNumber}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/account/orders">Track order</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">
              <ShoppingBag aria-hidden />
              Keep shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
