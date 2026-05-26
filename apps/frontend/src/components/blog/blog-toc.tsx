'use client';

import { cn } from '@twinspire/ui';
import * as React from 'react';

import type { TocItem } from './markdown';

export function BlogToc({ items }: { items: TocItem[] }): React.JSX.Element | null {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (items.length === 0 || typeof window === 'undefined') return;
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      <ul className="mt-3 space-y-2 border-l border-border pl-3">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li
              key={item.id}
              className={cn(item.level === 3 && 'ml-3 text-[0.8rem]')}
            >
              <a
                href={`#${item.id}`}
                className={cn(
                  'block py-0.5 transition-colors',
                  isActive
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
