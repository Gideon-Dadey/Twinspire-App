'use client';

import { Toaster, TooltipProvider } from '@twinspire/ui';
import { type ReactNode } from 'react';

import { QueryProvider } from './query-provider';
import { SessionProvider } from './session-provider';
import { ThemeProvider } from './theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>
          <TooltipProvider delayDuration={300} skipDelayDuration={150}>
            {children}
          </TooltipProvider>
        </SessionProvider>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}
