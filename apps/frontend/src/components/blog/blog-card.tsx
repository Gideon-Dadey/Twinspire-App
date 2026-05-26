import type { BlogPost } from '@twinspire/types';
import { Badge, cn } from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';
import Image from 'next/image';
import Link from 'next/link';

import { getAuthorById } from '@/data/posts';

export interface BlogCardProps {
  post: BlogPost;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BlogCard({ post, size = 'md', className }: BlogCardProps) {
  const author = getAuthorById(post.authorId);
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg',
        className,
      )}
    >
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className={cn(
            'relative block overflow-hidden bg-muted',
            size === 'lg' ? 'aspect-banner' : 'aspect-banner md:aspect-[16/10]',
          )}
        >
          <Image
            src={post.coverImage.url}
            alt={post.coverImage.alt}
            fill
            sizes={size === 'lg' ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
            className="object-cover transition-transform duration-moderate ease-spring group-hover:scale-[1.04]"
          />
        </Link>
      )}
      <div className={cn('flex flex-1 flex-col gap-3', size === 'lg' ? 'p-6' : 'p-5')}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.categorySlug && (
            <Badge variant="muted" size="sm" className="uppercase">
              {post.categorySlug.replace('-', ' ')}
            </Badge>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h3
            className={cn(
              'line-clamp-2 font-display font-semibold tracking-tight transition-colors group-hover:text-primary',
              size === 'lg' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl',
            )}
          >
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p
            className={cn(
              'text-muted-foreground',
              size === 'lg' ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm',
            )}
          >
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          {author && <span className="font-medium text-foreground">By {author.name}</span>}
          {post.readingTimeMinutes && (
            <>
              <span aria-hidden>·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
