'use client';

import { cn } from '@twinspire/ui';
import { Check } from 'lucide-react';
import * as React from 'react';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review & place order' },
];

export interface CheckoutStepperProps {
  current: CheckoutStep;
  completed: Set<CheckoutStep>;
  onStepClick?: (step: CheckoutStep) => void;
}

export function CheckoutStepper({ current, completed, onStepClick }: CheckoutStepperProps): React.JSX.Element {
  return (
    <ol className="flex w-full items-center gap-3" aria-label="Checkout progress">
      {STEPS.map((step, idx) => {
        const isCurrent = current === step.id;
        const isCompleted = completed.has(step.id);
        const canSelect = isCompleted || isCurrent;
        return (
          <li key={step.id} className="flex flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => canSelect && onStepClick?.(step.id)}
              aria-current={isCurrent ? 'step' : undefined}
              disabled={!canSelect}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-full transition-colors',
                'text-left text-sm font-medium',
                canSelect ? 'cursor-pointer hover:text-foreground' : 'cursor-default',
                isCurrent ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  isCompleted
                    ? 'border-success bg-success text-success-foreground'
                    : isCurrent
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="size-3.5" aria-hidden /> : idx + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1',
                  isCompleted ? 'bg-success/40' : 'bg-border',
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
