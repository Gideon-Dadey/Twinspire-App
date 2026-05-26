import type { Money } from '@twinspire/types';

export interface FormatMoneyOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero';
}

const moneyFormatterCache = new Map<string, Intl.NumberFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();
const numberFormatterCache = new Map<string, Intl.NumberFormat>();

function getMoneyFormatter(currency: string, opts: FormatMoneyOptions): Intl.NumberFormat {
  const locale = opts.locale ?? 'en-US';
  const key = `${locale}-${currency}-${opts.minimumFractionDigits ?? ''}-${opts.maximumFractionDigits ?? ''}-${opts.signDisplay ?? ''}`;
  let fmt = moneyFormatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: opts.minimumFractionDigits,
      maximumFractionDigits: opts.maximumFractionDigits,
      signDisplay: opts.signDisplay,
    });
    moneyFormatterCache.set(key, fmt);
  }
  return fmt;
}

/** Format a Money value to a localized currency string. */
export function formatMoney(money: Money, opts: FormatMoneyOptions = {}): string {
  return getMoneyFormatter(money.currency, opts).format(money.amount);
}

/** Format a raw amount with explicit currency. */
export function formatCurrency(
  amount: number,
  currency: string,
  opts: FormatMoneyOptions = {},
): string {
  return getMoneyFormatter(currency, opts).format(amount);
}

export function formatNumber(value: number, locale = 'en-US', options?: Intl.NumberFormatOptions): string {
  const key = `${locale}-${JSON.stringify(options ?? {})}`;
  let fmt = numberFormatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, options);
    numberFormatterCache.set(key, fmt);
  }
  return fmt.format(value);
}

export function formatPercent(value: number, locale = 'en-US', fractionDigits = 0): string {
  return formatNumber(value, locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

export function formatDate(date: Date | string | number, opts: FormatDateOptions = {}): string {
  const { locale = 'en-US', ...dateOpts } = opts;
  const key = `${locale}-${JSON.stringify(dateOpts)}`;
  let fmt = dateFormatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...dateOpts,
    });
    dateFormatterCache.set(key, fmt);
  }
  return fmt.format(new Date(date));
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['week', 7 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
];

export function formatRelativeTime(
  date: Date | string | number,
  locale = 'en-US',
  now: Date = new Date(),
): string {
  const target = new Date(date).getTime();
  const diff = target - now.getTime();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (abs >= ms || unit === 'second') {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return rtf.format(0, 'second');
}

export function truncate(input: string, max: number, suffix = '…'): string {
  if (input.length <= max) return input;
  return input.slice(0, Math.max(0, max - suffix.length)) + suffix;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const safeIndex = Math.min(i, sizes.length - 1);
  return `${(bytes / Math.pow(k, safeIndex)).toFixed(decimals)} ${sizes[safeIndex]}`;
}
