import { Reveal, Badge } from '@twinspire/ui';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getAllPosts, getAuthorById } from '@/data/posts';
import { formatDate } from '@twinspire/utils';

export function EditorialStrip() {
  const posts = getAllPosts().slice(0, 3);
  return (
    <section className="container mx-auto px-3 py-10 sm:px-4 sm:py-14 md:py-24">
      <Reveal>
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary text-sm font-medium uppercase tracking-wider">
              From the editors
            </p>
            <h2 className="type-section-heading mt-2">Reviews, buying guides &amp; deep dives.</h2>
          </div>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground group inline-flex w-fit items-center gap-1.5 text-sm font-medium transition-colors"
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
              <article className="border-border bg-card group flex h-full flex-col overflow-hidden rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-lg">
                {post.coverImage && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="aspect-banner bg-muted relative block overflow-hidden"
                  >
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="duration-moderate ease-spring object-cover transition-transform group-hover:scale-[1.04]"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
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
                    <h3 className="font-display group-hover:text-primary line-clamp-2 text-lg font-semibold tracking-tight transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
                  )}
                  <div className="text-muted-foreground mt-auto flex items-center gap-2 text-xs">
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
