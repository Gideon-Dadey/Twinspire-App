'use client';

import { QueryClientProvider, isServer } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode } from 'react';

import { createQueryClient } from '@/lib/query-client';

let browserQueryClient: ReturnType<typeof createQueryClient> | undefined;

function getQueryClient() {
  if (isServer) return createQueryClient();
  if (!browserQueryClient) browserQueryClient = createQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
