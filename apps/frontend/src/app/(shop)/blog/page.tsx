import type { Metadata } from 'next';

import { Breadcrumb } from '@twinspire/ui';

import { BlogCard } from '@/components/blog/blog-card';
import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';
import { getAllPosts, tags } from '@/data/posts';

export const metadata: Metadata = {
  title: 'Blog · Reviews, buying guides & deep dives',
  description:
    'Expert electronics reviews, buying guides, and editorial commentary from the TwinSpire team.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="container mx-auto px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
        linkComponent={NextLinkBreadcrumb}
        className="mb-6"
      />

      <header className="mb-12 max-w-2xl">
        <p className="text-primary text-sm font-medium uppercase tracking-wider">
          The TwinSpire blog
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
          Reviews, buying guides &amp; deep dives.
        </h1>
        <p className="text-muted-foreground mt-3">
          From hands-on hardware reviews to industry analysis — written by our editors, not paid by
          the brands we cover.
        </p>
      </header>

      <ul className="mb-10 flex flex-wrap gap-2 text-xs">
        {tags.map((tag) => (
          <li key={tag.id}>
            <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-1 rounded-full border px-3 py-1">
              #{tag.slug} · <span className="text-foreground">{tag.postCount ?? 0}</span>
            </span>
          </li>
        ))}
      </ul>

      {featured && (
        <div className="mb-12">
          <BlogCard post={featured} size="lg" />
        </div>
      )}

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <li key={post.id}>
            <BlogCard post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
