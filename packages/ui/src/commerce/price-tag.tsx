import type { ProductPrice } from '@twinspire/types';
import * as React from 'react';

import { cn } from '../lib/cn';

import { Money } from './money';

export interface PriceTagProps {
  price: ProductPrice;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end';
  className?: string;
  showCompare?: boolean;
  showDiscount?: boolean;
  /**
   * Color tone for the main price amount.
   * - `default` (foreground) is used in product detail pages and cart.
   * - `primary` paints the price in brand orange (product cards / hero pricing).
   * - `destructive` (legacy) — only emitted automatically when a compare price exists
   *   AND `tone` is left at `default`. Pass `primary` to opt out.
   */
  tone?: 'default' | 'primary';
}

const sizeStyles = {
  sm: { current: 'text-sm font-semibold', compare: 'text-xs', discount: 'text-[10px]' },
  md: { current: 'text-base font-semibold', compare: 'text-xs', discount: 'text-xs' },
  lg: { current: 'text-xl font-bold', compare: 'text-sm', discount: 'text-xs' },
  xl: { current: 'text-3xl font-bold tracking-tight', compare: 'text-base', discount: 'text-sm' },
} as const;

export function PriceTag({
  price,
  size = 'md',
  align = 'start',
  className,
  showCompare = true,
  showDiscount = true,
  tone = 'default',
}: PriceTagProps): React.JSX.Element {
  const hasCompare = showCompare && price.compareAtAmount != null && price.compareAtAmount > price.amount;
  const discountPercent =
    showDiscount && price.discountPercent != null
      ? Math.round(price.discountPercent)
      : hasCompare && price.compareAtAmount
        ? Math.round(((price.compareAtAmount - price.amount) / price.compareAtAmount) * 100)
        : 0;
  const styles = sizeStyles[size];
  const mainTone =
    tone === 'primary' ? 'text-primary' : hasCompare ? 'text-destructive' : 'text-foreground';

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-foreground',
        align === 'center' && 'justify-center',
        align === 'end' && 'justify-end',
        className,
      )}
    >
      <Money
        amount={price.amount}
        currency={price.currency}
        className={cn(styles.current, mainTone)}
      />
      {hasCompare && price.compareAtAmount != null && (
        <Money
          amount={price.compareAtAmount}
          currency={price.currency}
          strikethrough
          className={cn(styles.compare, 'text-muted-foreground')}
        />
      )}
      {discountPercent > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full bg-success/15 px-1.5 py-0.5 font-semibold text-success',
            styles.discount,
          )}
        >
          −{discountPercent}%
        </span>
      )}
    </div>
  );
}
