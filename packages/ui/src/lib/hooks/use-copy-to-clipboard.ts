'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardOptions {
  /** Reset to `false` after this many ms (default 2000). */
  resetAfterMs?: number;
}

export interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (value: string) => Promise<boolean>;
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardResult {
  const { resetAfterMs = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else if (typeof document !== 'undefined') {
          const el = document.createElement('textarea');
          el.value = value;
          el.style.position = 'fixed';
          el.style.left = '-9999px';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        } else {
          return false;
        }
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
