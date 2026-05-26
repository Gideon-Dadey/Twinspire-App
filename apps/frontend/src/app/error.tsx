'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-destructive">Error</p>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        Something went wrong.
      </h1>
      <p className="max-w-md text-balance text-sm text-muted-foreground">
        We hit an unexpected issue. Our team has been notified. You can try again or head back to
        the homepage.
      </p>
      {error.digest ? (
        <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          digest: {error.digest}
        </code>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:shadow-glow"
      >
        Try again
      </button>
    </main>
  );
}
