import type { ReactNode } from 'react';

interface AccountPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AccountPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AccountPageHeaderProps) {
  return (
    <header className="border-border flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-primary text-xs font-semibold uppercase tracking-wide">{eyebrow}</p>
        ) : null}
        <h1 className="type-page-heading font-semibold">{title}</h1>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
