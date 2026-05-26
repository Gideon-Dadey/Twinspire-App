import type { ReactNode } from 'react';

interface AccountPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AccountPageHeader({ eyebrow, title, description, actions }: AccountPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-display font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
