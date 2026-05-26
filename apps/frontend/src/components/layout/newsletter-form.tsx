'use client';

import { Button, Input } from '@twinspire/ui';
import { Mail, CheckCircle2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

export function NewsletterForm(): React.JSX.Element {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'subscribed'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus('subscribed');
    toast.success('Welcome to TwinSpire — check your inbox to confirm.');
  }

  if (status === 'subscribed') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-5 py-4 text-success">
        <CheckCircle2 className="size-5" aria-hidden />
        <p className="text-sm">
          Thanks — we sent a confirmation to <span className="font-semibold">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@yourdomain.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 pl-9 text-base"
        />
      </div>
      <Button type="submit" size="lg" loading={status === 'submitting'}>
        Subscribe
      </Button>
    </form>
  );
}
