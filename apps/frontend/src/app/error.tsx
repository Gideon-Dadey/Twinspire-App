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
      <p className="text-destructive text-xs font-medium uppercase tracking-wider">Error</p>
      <h1 className="type-page-heading">Something went wrong.</h1>
      <p className="text-muted-foreground max-w-md text-balance text-sm">
        We hit an unexpected issue. Our team has been notified. You can try again or head back to
        the homepage.
      </p>
      {error.digest ? (
        <code className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
          digest: {error.digest}
        </code>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-primary-foreground hover:shadow-glow inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold transition"
      >
        Try again
      </button>
    </main>
  );
}
