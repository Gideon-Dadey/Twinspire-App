import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';

import { ApiError } from './api-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          if (error instanceof ApiError) {
            if (error.status === 401 || error.status === 403 || error.status === 404) {
              return false;
            }
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
      dehydrate: {
        shouldDehydrateQuery(query) {
          return defaultShouldDehydrateQuery(query) || query.state.status === 'pending';
        },
      },
    },
  });
}
