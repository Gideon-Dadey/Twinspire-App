'use client';

import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { Toaster as SonnerToaster, toast } from 'sonner';

import { cn } from '../lib/cn';

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * App-wide Sonner toaster with TwinSpire styling.
 *
 * Design system notes
 * -------------------
 * The visual treatment is intentionally restrained — a white card with a
 * subtle border, soft elevation shadow, and a small variant-coloured icon +
 * accent rail on the left edge. This mirrors the patterns used by Linear,
 * Vercel, and Stripe rather than the loud full-flood styling that ships as
 * Sonner's `richColors` default.
 *
 * Variant accents (icon + left rail tint):
 *   success → emerald
 *   error   → rose
 *   warning → amber
 *   info    → sky
 *   loading → primary (brand red)
 *
 * Typography is two-tier:
 *   - title:       text-sm font-semibold text-foreground
 *   - description: text-xs text-muted-foreground (relaxed leading)
 *
 * Behaviour:
 *   - Top-right on desktop, top-centre on small screens (Sonner handles the
 *     responsive switch when `position="top-right"` is set).
 *   - 4.5s default duration; loading toasts stay until dismissed.
 *   - Close button always available; toasts are swipe-dismissable on mobile.
 *   - `role="status"` for non-critical toasts, `role="alert"` for errors
 *     (provided by Sonner's `data-type` defaults).
 */
export function Toaster({ className, ...props }: ToasterProps): React.JSX.Element {
  return (
    <SonnerToaster
      // `light` is forced because the storefront is single-theme. If we ever
      // re-introduce dark mode, swap this back to `"system"`.
      theme="light"
      position="top-right"
      duration={4500}
      visibleToasts={4}
      closeButton
      // We supply our own icons (lucide) so the brand language stays consistent
      // and so the icon can pick up the variant accent colour via the
      // surrounding `data-type` class.
      icons={{
        success: <CheckCircle2 className="size-[18px] text-emerald-600" aria-hidden />,
        error: <XCircle className="size-[18px] text-rose-600" aria-hidden />,
        warning: <AlertTriangle className="size-[18px] text-amber-600" aria-hidden />,
        info: <Info className="size-[18px] text-sky-600" aria-hidden />,
        loading: <Loader2 className="text-primary size-[18px] animate-spin" aria-hidden />,
      }}
      className={cn('toaster', className)}
      toastOptions={{
        // The Tailwind class set below produces the base "card" — every variant
        // adds its accent rail and icon tint via the `data-type=*` selectors
        // declared in `packages/ui/src/styles/globals.css`.
        classNames: {
          toast: cn(
            'group relative flex w-full items-start gap-3 overflow-hidden',
            'border-border bg-background rounded-lg border py-3.5 pl-4 pr-3.5',
            'text-foreground shadow-[0_10px_28px_-12px_rgba(15,23,42,0.18),0_2px_6px_-2px_rgba(15,23,42,0.08)]',
            // Soft variant accent rail on the left edge (4px). Each variant
            // overrides the colour via `data-type` selectors in globals.css.
            'before:bg-border before:absolute before:inset-y-2 before:left-1 before:w-[3px] before:rounded-full',
          ),
          title: 'text-sm font-semibold leading-snug tracking-tight text-foreground',
          description: 'mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground',
          icon: 'mt-0.5 shrink-0',
          content: 'flex-1 min-w-0',
          actionButton: cn(
            'bg-primary text-primary-foreground h-7 shrink-0 rounded-md px-2.5 text-xs font-semibold',
            'hover:bg-primary/90 shadow-sm transition-colors',
          ),
          cancelButton: cn(
            'bg-muted text-muted-foreground h-7 shrink-0 rounded-md px-2.5 text-xs font-medium',
            'hover:bg-muted/80 transition-colors',
          ),
          closeButton: cn(
            // Sonner positions the close button absolutely. We restyle it from
            // a pill into a subtle ghost icon-button so it doesn't compete
            // visually with the toast content.
            '!left-auto !right-2 !top-2 !translate-x-0 !translate-y-0',
            '!size-6 !rounded-md !border-transparent !bg-transparent',
            'text-muted-foreground hover:!bg-muted hover:text-foreground',
            'opacity-0 transition-opacity duration-150 focus:opacity-100 group-hover:opacity-100',
          ),
        },
      }}
      {...props}
    />
  );
}

export { toast };
