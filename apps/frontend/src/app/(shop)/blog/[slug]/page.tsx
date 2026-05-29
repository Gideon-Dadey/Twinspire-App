import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage, Badge, Breadcrumb } from '@twinspire/ui';
import { formatDate } from '@twinspire/utils';

import { BlogCard } from '@/components/blog/blog-card';
import { BlogToc } from '@/components/blog/blog-toc';
import { extractToc, Markdown } from '@/components/blog/markdown';
import { JsonLd } from '@/components/shared/json-ld';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { getAuthorById, getPostBySlug, getRelatedPosts, getTagById, posts } from '@/data/posts';
import { blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/helpers/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage.url }] : undefined,
      publishedTime: post.publishedAt,
    },
  };
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const author = getAuthorById(post.authorId);
  const related = getRelatedPosts(post.id, 3);
  const toc = extractToc(post.body);
  const postTags = post.tagIds
    .map((id) => getTagById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post, author?.name ?? 'TwinSpire')} />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbItems.map((item) => ({ name: item.label, url: item.href })),
        )}
      />

      <article className="container mx-auto px-3 pb-20 pt-8 sm:px-4 md:pt-12">
        <Breadcrumb items={breadcrumbItems} linkComponent={NextLinkBreadcrumb} className="mb-6" />

        <header className="mx-auto max-w-3xl text-center">
          {post.categorySlug && (
            <Badge variant="muted" size="md" className="uppercase">
              {post.categorySlug.replace('-', ' ')}
            </Badge>
          )}
          <h1 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-muted-foreground mt-4 text-pretty text-base md:text-lg">
              {post.excerpt}
            </p>
          )}
          <div className="text-muted-foreground mt-6 flex items-center justify-center gap-3 text-sm">
            {author && (
              <span className="inline-flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={author.avatarUrl} alt={author.name} />
                  <AvatarFallback>{initials(author.name)}</AvatarFallback>
                </Avatar>
                <span className="text-foreground font-medium">{author.name}</span>
              </span>
            )}
            {post.publishedAt && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </>
            )}
            {post.readingTimeMinutes && (
              <>
                <span aria-hidden>·</span>
                <span>{post.readingTimeMinutes} min read</span>
              </>
            )}
          </div>
        </header>

        {post.coverImage && (
          <div className="aspect-banner border-border bg-muted relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-lg border">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              fill
              sizes="(min-width: 1280px) 1024px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_240px]">
          <Markdown body={post.body} className="max-w-3xl" />
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <BlogToc items={toc} />
          </aside>
        </div>

        {postTags.length > 0 && (
          <div className="mx-auto mt-16 flex max-w-3xl flex-wrap gap-2">
            {postTags.map((tag) => (
              <Badge key={tag.id} variant="muted" size="md">
                #{tag.slug}
              </Badge>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display mb-6 text-2xl font-bold tracking-tight md:text-3xl">
              Keep reading
            </h2>
            <ul className="grid gap-6 md:grid-cols-3">
              {related.map((rel) => (
                <li key={rel.id}>
                  <BlogCard post={rel} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
