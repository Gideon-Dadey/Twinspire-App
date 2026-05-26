export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  signal?: AbortSignal;
  onRetry?: (error: unknown, attempt: number) => void;
}

/** Exponential backoff retry with optional jitter and abort signal. */
export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    minDelayMs = 200,
    maxDelayMs = 5_000,
    factor = 2,
    jitter = true,
    signal,
    onRetry,
  } = opts;

  let attempt = 0;
  while (true) {
    if (signal?.aborted) throw new Error('Aborted');
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) throw error;
      onRetry?.(error, attempt);
      const exp = Math.min(maxDelayMs, minDelayMs * Math.pow(factor, attempt - 1));
      const ms = jitter ? Math.floor(Math.random() * exp) : exp;
      await delay(ms);
    }
  }
}
