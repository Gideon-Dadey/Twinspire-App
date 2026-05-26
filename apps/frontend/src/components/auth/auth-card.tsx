import Link from 'next/link';
import { type ReactNode } from 'react';

import { siteConfig } from '@/lib/site-config';

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthCard({ eyebrow, title, description, footer, children }: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
      >
        <span
          aria-hidden
          className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          T
        </span>
        {siteConfig.name}
      </Link>
      <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-display font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </div>
  );
}
