'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from '@twinspire/ui';
import { formatRelativeTime } from '@twinspire/utils';
import type { ReviewStatus } from '@twinspire/types';
import { Check, Flag, Loader2, Star, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { AdminReviewItem } from '@/lib/api/admin-types';
import {
  useAdminReviews,
  useDeleteAdminReview,
  useModerateAdminReview,
} from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';

import { Paginator } from './paginator';

const STATUS_TABS: Array<{ value: ReviewStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

export function ReviewsPageContent() {
  const { user } = useSession();
  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  const [tab, setTab] = useState<ReviewStatus | 'all'>('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminReviews({
    page,
    perPage: 12,
    status: tab,
  });

  const moderateMutation = useModerateAdminReview();
  const deleteMutation = useDeleteAdminReview();

  const [moderating, setModerating] = useState<{ review: AdminReviewItem; status: 'rejected' | 'flagged' } | null>(null);
  const [note, setNote] = useState('');

  async function quickModerate(review: AdminReviewItem, status: 'approved') {
    await moderateMutation.mutateAsync({ id: review.id, input: { status } });
  }

  async function submitModeration() {
    if (!moderating) return;
    await moderateMutation.mutateAsync({
      id: moderating.review.id,
      input: { status: moderating.status, moderatorNote: note || undefined },
    });
    setNote('');
    setModerating(null);
  }

  return (
    <div className="space-y-5">
      <Tabs value={tab} onValueChange={(v) => {
        setPage(1);
        setTab(v as ReviewStatus | 'all');
      }}>
        <TabsList>
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">Nothing in this queue. 🎉</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {data?.items.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <Link
                  href={review.product.slug ? `/products/${review.product.slug}` : '#'}
                  className="flex shrink-0 items-center gap-3"
                >
                  {review.product.images[0]?.url ? (
                    <span className="relative size-14 overflow-hidden rounded-md border border-border/60 bg-muted">
                      <Image src={review.product.images[0].url} alt={review.product.images[0].alt ?? review.product.name} fill sizes="56px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="size-14 rounded-md border border-dashed border-border/60" />
                  )}
                  <div className="min-w-0 sm:hidden">
                    <p className="truncate text-sm font-medium">{review.product.name}</p>
                  </div>
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={review.product.slug ? `/products/${review.product.slug}` : '#'}
                      className="hidden text-sm font-medium hover:underline sm:block"
                    >
                      {review.product.name}
                    </Link>
                    <StatusBadge status={review.status} />
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn('size-3.5', i < review.rating ? 'fill-current' : 'opacity-30')}
                          aria-hidden
                        />
                      ))}
                    </div>
                    {review.verifiedPurchase ? (
                      <Badge variant="outline">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-300">Unverified</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</span>
                  </div>

                  {review.title ? (
                    <p className="mt-2 text-sm font-medium text-foreground">{review.title}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    By <span className="font-medium text-foreground">{review.authorName ?? 'Anonymous'}</span>{' '}
                    · {review.helpfulCount} helpful · {review.notHelpfulCount} not helpful
                  </p>
                  {review.moderatorNote ? (
                    <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
                      Moderator note: {review.moderatorNote}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={moderateMutation.isPending || review.status === 'approved'}
                    onClick={() => void quickModerate(review, 'approved')}
                  >
                    <Check className="size-4" aria-hidden /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={moderateMutation.isPending || review.status === 'rejected'}
                    onClick={() => setModerating({ review, status: 'rejected' })}
                  >
                    <X className="size-4" aria-hidden /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={moderateMutation.isPending}
                    onClick={() => setModerating({ review, status: 'flagged' })}
                  >
                    <Flag className="size-4" aria-hidden /> Flag
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        disabled={!canDelete || deleteMutation.isPending}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete review?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The review will be permanently removed. Consider rejecting first.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void deleteMutation.mutateAsync(review.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data ? (
        <Paginator
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          perPage={data.perPage}
          onPageChange={setPage}
        />
      ) : null}

      <Dialog open={Boolean(moderating)} onOpenChange={(o) => !o && setModerating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderating?.status === 'rejected' ? 'Reject review' : 'Flag review'}
            </DialogTitle>
            <DialogDescription>
              {moderating?.status === 'rejected'
                ? 'The customer will be notified that their review did not meet guidelines.'
                : 'Flagging keeps the review hidden while you investigate.'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Internal moderator note (optional)"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModerating(null)}>Cancel</Button>
            <Button onClick={() => void submitModeration()} disabled={moderateMutation.isPending}>
              {moderateMutation.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  if (status === 'approved') {
    return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Approved</Badge>;
  }
  if (status === 'rejected') {
    return <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300">Rejected</Badge>;
  }
  if (status === 'flagged') {
    return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">Flagged</Badge>;
  }
  return <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">Pending</Badge>;
}
