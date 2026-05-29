import { cn } from '@twinspire/ui';

/** Placeholder while URL-driven catalog controls hydrate (useSearchParams). */
export function SortSelectFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border-input bg-background shadow-xs h-10 w-[200px] rounded-lg border',
        className,
      )}
      aria-hidden
    />
  );
}

export function FiltersPanelFallback({ className }: { className?: string }) {
  return (
    <aside className={className} aria-hidden>
      <div className="border-border mb-4 border-b pb-3">
        <div className="bg-muted h-5 w-20 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-muted h-4 w-full max-w-[12rem] rounded" />
        ))}
      </div>
    </aside>
  );
}

export function ActiveFiltersFallback() {
  return null;
}

export function FiltersMobileTriggerFallback() {
  return (
    <div
      className="border-input bg-background h-9 w-[4.5rem] rounded-md border lg:hidden"
      aria-hidden
    />
  );
}
