'use client';

import { Button } from '@twinspire/ui';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

type Status = 'pending' | 'success' | 'error';

export function VerifyEmailStatus() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('pending');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await api.auth.verifyEmail(token);
        if (cancelled) return;
        setStatus('success');
        setMessage(result.message ?? 'Email verified.');
      } catch (err) {
        if (cancelled) return;
        const m = (err as { message?: string }).message ?? 'Verification link is invalid or has expired.';
        setStatus('error');
        setMessage(m);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
        <p>Verifying your email…</p>
      </div>
    );
  }
  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild fullWidth>
          <Link href="/account">Continue to your account</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-4 text-center">
      <XCircle className="mx-auto size-12 text-destructive" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline" fullWidth>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
