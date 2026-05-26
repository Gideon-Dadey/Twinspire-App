import { type ReactNode } from 'react';

/**
 * Card width preset.
 * - `md` (28rem / 448px): login, forgot-password, OTP, simple single-column forms.
 * - `lg` (32rem / 512px): register and any form with side-by-side fields.
 * - `xl` (36rem / 576px): step-driven flows with multiple sections.
 */
type AuthCardWidth = 'md' | 'lg' | 'xl';

const WIDTH_CLASSES: Record<AuthCardWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  /** Width preset; defaults to `md`. */
  width?: AuthCardWidth;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  footer,
  children,
  width = 'md',
}: AuthCardProps) {
  // The branding lockup (logo) lives in the surrounding (auth) layout header.
  // This card only owns the form chrome — width, title hierarchy, and the
  // sub-card footer link below it.
  return (
    <div className={`mx-auto w-full ${WIDTH_CLASSES[width]}`}>
      <div className="border-border bg-card rounded-lg border p-8 shadow-sm">
        {eyebrow ? (
          <p className="text-primary text-xs font-semibold uppercase tracking-wide">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-foreground mt-1 text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? <p className="text-muted-foreground mt-2 text-sm">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <div className="text-muted-foreground mt-4 text-center text-sm">{footer}</div>
      ) : null}
    </div>
  );
}
