import { ChevronRight, Slash } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type BreadcrumbLinkComponent = React.ComponentType<{
  href: string;
  className?: string;
  children: React.ReactNode;
}>;

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: 'chevron' | 'slash';
  linkComponent?: BreadcrumbLinkComponent;
}

const defaultLink: BreadcrumbLinkComponent = ({ href, children, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

export function Breadcrumb({
  items,
  separator = 'chevron',
  className,
  linkComponent: LinkComp = defaultLink,
  ...props
}: BreadcrumbProps): React.JSX.Element {
  const Sep = separator === 'chevron' ? ChevronRight : Slash;
  return (
    <nav aria-label="Breadcrumb" className={cn('flex w-full items-center', className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <LinkComp
                  href={item.href}
                  className="rounded-md px-1 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </LinkComp>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(isLast ? 'font-medium text-foreground' : '')}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <Sep className="size-3.5 text-muted-foreground/50" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
