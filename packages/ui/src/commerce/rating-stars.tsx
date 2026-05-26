import { Star } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface RatingStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–5, decimals allowed. */
  value: number;
  count?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  /** Total star count (default 5). */
  max?: number;
}

const sizeMap = {
  xs: { star: 'size-3', text: 'text-[10px]' },
  sm: { star: 'size-3.5', text: 'text-xs' },
  md: { star: 'size-4', text: 'text-sm' },
  lg: { star: 'size-5', text: 'text-base' },
} as const;

export function RatingStars({
  value,
  count,
  size = 'sm',
  showValue = false,
  showCount = true,
  max = 5,
  className,
  ...props
}: RatingStarsProps): React.JSX.Element {
  const clamped = Math.max(0, Math.min(max, value));
  const fillPercent = (clamped / max) * 100;
  const { star, text } = sizeMap[size];

  return (
    <div
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} of ${max}${count ? ` from ${count} reviews` : ''}`}
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    >
      <span className="relative inline-flex" aria-hidden>
        <span className="inline-flex text-muted-foreground/40">
          {Array.from({ length: max }, (_, i) => (
            <Star key={`bg-${i}`} className={cn(star)} aria-hidden />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex overflow-hidden text-accent"
          style={{ width: `${fillPercent}%` }}
        >
          {Array.from({ length: max }, (_, i) => (
            <Star key={`fg-${i}`} className={cn(star, 'fill-accent')} aria-hidden />
          ))}
        </span>
      </span>
      {showValue && (
        <span className={cn('font-medium text-foreground', text)}>
          {clamped.toFixed(1)}
        </span>
      )}
      {showCount && typeof count === 'number' && (
        <span className={cn('text-muted-foreground', text)}>({count.toLocaleString()})</span>
      )}
    </div>
  );
}
