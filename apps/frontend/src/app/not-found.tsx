import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-primary">404</p>
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="max-w-md text-balance text-muted-foreground">
        It might have been moved, renamed, or never existed. Try searching, or head back home.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:shadow-glow"
        >
          Back to homepage
        </Link>
        <Link
          href="/search"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Search products
        </Link>
      </div>
    </main>
  );
}
