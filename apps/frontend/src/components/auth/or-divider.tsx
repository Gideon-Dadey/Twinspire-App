interface OrDividerProps {
  label?: string;
}

export function OrDivider({ label = 'or' }: OrDividerProps) {
  return (
    <div className="my-6 flex items-center gap-3" role="separator">
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
