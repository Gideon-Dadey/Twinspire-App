import { Reveal, Badge } from '@twinspire/ui';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getAllPosts, getAuthorById } from '@/data/posts';
import { formatDate } from '@twinspire/utils';

export function EditorialStrip() {
  const posts = getAllPosts().slice(0, 3);
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Reveal>
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              From the editors
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Reviews, buying guides &amp; deep dives.
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            See the blog
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </header>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post, idx) => {
          const author = getAuthorById(post.authorId);
          return (
            <Reveal key={post.id} delay={idx * 0.05}>
              <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
                {post.coverImage && (
                  <Link href={`/blog/${post.slug}`} className="relative block aspect-banner overflow-hidden bg-muted">
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-moderate ease-spring group-hover:scale-[1.04]"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col gap-3 p-5">
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
                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="line-clamp-2 font-display text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                  )}
                  <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                    {author && <span>By {author.name}</span>}
                    {post.readingTimeMinutes && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{post.readingTimeMinutes} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
