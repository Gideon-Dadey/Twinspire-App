'use client';

import { cn } from '@twinspire/ui';

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  hints: string[];
}

const HINTS = [
  { check: (p: string) => p.length >= 12, label: 'At least 12 characters' },
  { check: (p: string) => /[A-Z]/.test(p), label: 'An uppercase letter' },
  { check: (p: string) => /[a-z]/.test(p), label: 'A lowercase letter' },
  { check: (p: string) => /\d/.test(p), label: 'A number' },
  { check: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'A symbol' },
];

export function scorePassword(password: string): PasswordStrength {
  if (!password) return { score: 0, label: 'Required', hints: HINTS.map((h) => h.label) };
  const failed = HINTS.filter((h) => !h.check(password)).map((h) => h.label);
  const passed = HINTS.length - failed.length;
  const score = Math.min(4, Math.max(0, passed - 1)) as PasswordStrength['score'];
  const labels: PasswordStrength['label'][] = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] ?? 'Too weak', hints: failed };
}

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = scorePassword(password);
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < strength.score
                ? strength.score <= 1
                  ? 'bg-destructive'
                  : strength.score === 2
                    ? 'bg-amber-500'
                    : strength.score === 3
                      ? 'bg-primary'
                      : 'bg-success'
                : 'bg-muted',
            )}
          />
        ))}
        <span
          className={cn(
            'min-w-16 text-right text-xs font-medium',
            strength.score >= 3 ? 'text-success' : 'text-muted-foreground',
          )}
        >
          {strength.label}
        </span>
      </div>
      {strength.hints.length > 0 ? (
        <ul className="grid gap-0.5 text-xs text-muted-foreground">
          {strength.hints.map((hint) => (
            <li key={hint} className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/60" />
              {hint}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
