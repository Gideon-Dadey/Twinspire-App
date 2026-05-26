'use client';

import { Button, Input } from '@twinspire/ui';
import { Tag } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { lookupCoupon } from '@/lib/helpers/cart-math';
import { useCartStore } from '@/lib/stores/cart-store';

export function CouponForm(): React.JSX.Element {
  const couponCode = useCartStore((s) => s.couponCode);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const [draft, setDraft] = React.useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = draft.trim().toUpperCase();
    if (!code) return;
    const found = lookupCoupon(code);
    if (!found) {
      toast.error('That code isn\'t valid.', { description: 'Try WELCOME10, SHIP99, or TWIN50.' });
      return;
    }
    applyCoupon(code);
    toast.success(`Applied ${code}`, { description: found.description });
    setDraft('');
  }

  if (couponCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm">
        <div className="flex items-center gap-2 text-success">
          <Tag className="size-4" aria-hidden />
          <span className="font-medium">{couponCode}</span>
          <span className="text-success/80">applied</span>
        </div>
        <button
          type="button"
          onClick={() => applyCoupon(undefined)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value.toUpperCase())}
        placeholder="Promo code (e.g. WELCOME10)"
        autoCapitalize="characters"
        className="font-mono uppercase"
      />
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}
