'use client';

import { Breadcrumb, cn } from '@twinspire/ui';
import type { ReactNode } from 'react';

import { NextLinkBreadcrumb } from '@/components/shared/next-adapters';

export interface AdminBreadcrumb {
  label: string;
  href?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: AdminBreadcrumb[];
  actions?: ReactNode;
  className?: string;
  meta?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  breadcrumb,
  actions,
  meta,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {breadcrumb?.length ? (
        <Breadcrumb
          items={[{ label: 'Admin', href: '/admin' }, ...breadcrumb]}
          linkComponent={NextLinkBreadcrumb}
        />
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
          {meta}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
