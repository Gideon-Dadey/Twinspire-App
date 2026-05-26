import type { ProductRatingSummary, Review } from '@twinspire/types';
import { Avatar, AvatarFallback, AvatarImage, Badge, Progress, RatingStars } from '@twinspire/ui';
import { ShieldCheck } from 'lucide-react';
import { formatRelativeTime } from '@twinspire/utils';

export interface ProductReviewsProps {
  rating?: ProductRatingSummary;
  reviews: Review[];
}

function initials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProductReviews({ rating, reviews }: ProductReviewsProps) {
  const total = rating?.count ?? reviews.length;
  return (
    <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <div>
          <p className="font-display text-4xl font-bold tracking-tight">
            {rating?.average.toFixed(1) ?? '—'}
          </p>
          <RatingStars value={rating?.average ?? 0} count={total} size="md" showCount={false} />
          <p className="mt-1 text-sm text-muted-foreground">
            {total.toLocaleString()} customer {total === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {rating && (
          <ul className="space-y-2">
            {(['5', '4', '3', '2', '1'] as const).map((bucket) => {
              const count = rating.distribution[bucket] ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <li key={bucket} className="flex items-center gap-3 text-xs">
                  <span className="w-8 tabular-nums">{bucket}★</span>
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="w-10 tabular-nums text-right text-muted-foreground">{count}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ul className="divide-y divide-border">
        {reviews.length === 0 && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            No reviews yet — be the first to share your experience.
          </li>
        )}
        {reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-3 py-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={review.authorAvatarUrl} alt={review.authorName ?? ''} />
                <AvatarFallback>{initials(review.authorName)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">
                  {review.authorName ?? 'Anonymous'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RatingStars value={review.rating} size="xs" showCount={false} />
                  <span aria-hidden>·</span>
                  <time dateTime={review.createdAt}>
                    {formatRelativeTime(review.createdAt)}
                  </time>
                  {review.verifiedPurchase && (
                    <Badge variant="success" size="sm" className="inline-flex items-center gap-1">
                      <ShieldCheck className="size-3" aria-hidden /> Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {review.title && (
              <h3 className="text-sm font-semibold text-foreground">{review.title}</h3>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
            <p className="text-xs text-muted-foreground">
              {review.helpfulCount.toLocaleString()} found this helpful
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
