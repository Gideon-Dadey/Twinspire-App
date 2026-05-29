import { Breadcrumb, Button } from '@twinspire/ui';
import Link from 'next/link';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export interface StubPageProps {
  breadcrumbs: { label: string; href?: string }[];
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: { label: string; href: string };
}

export function StubPage({
  breadcrumbs,
  eyebrow,
  title,
  description,
  children,
  primaryAction,
}: StubPageProps) {
  return (
    <div className="container mx-auto max-w-4xl px-3 pb-16 pt-8 sm:px-4 md:pt-12">
      <Breadcrumb items={breadcrumbs} linkComponent={NextLinkBreadcrumb} className="mb-6" />
      <header className="mb-10">
        {eyebrow && (
          <p className="text-primary text-sm font-medium uppercase tracking-wider">{eyebrow}</p>
        )}
        <h1 className="type-page-heading mt-2">{title}</h1>
        {description && <p className="text-muted-foreground mt-3 max-w-2xl">{description}</p>}
        {primaryAction && (
          <Button asChild className="mt-6">
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        )}
      </header>
      {children && (
        <div className="prose prose-sm text-muted-foreground max-w-none text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
