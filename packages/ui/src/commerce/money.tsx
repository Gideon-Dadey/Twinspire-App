import { formatMoney, type FormatMoneyOptions } from '@twinspire/utils';
import type { Money as MoneyType, CurrencyCode } from '@twinspire/types';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface MoneyProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    FormatMoneyOptions {
  /** Either pass a Money object… */
  value?: MoneyType;
  /** …or an amount + currency. */
  amount?: number;
  currency?: CurrencyCode;
  /** Render a strike-through (used for compare-at prices). */
  strikethrough?: boolean;
}

export function Money({
  value,
  amount,
  currency,
  locale,
  minimumFractionDigits,
  maximumFractionDigits,
  signDisplay,
  strikethrough,
  className,
  ...props
}: MoneyProps): React.JSX.Element | null {
  const money: MoneyType | undefined = value ?? (amount != null && currency ? { amount, currency } : undefined);
  if (!money) return null;
  const formatted = formatMoney(money, {
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay,
  });
  return (
    <span
      data-currency={money.currency}
      className={cn(strikethrough && 'line-through opacity-70', className)}
      {...props}
    >
      {formatted}
    </span>
  );
}
