'use client';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Spinner,
} from '@twinspire/ui';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { useSession } from '@/lib/hooks/use-session';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { TwoFactorSetupResult } from '@/lib/api/types';

export function TwoFactorCard() {
  const { user } = useSession();
  const setUser = useAuthStore((s) => s.setUser);
  const enabled = Boolean(user?.twoFactorEnabled);

  const [setupResult, setSetupResult] = useState<TwoFactorSetupResult | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [busy, setBusy] = useState(false);

  async function beginSetup() {
    setBusy(true);
    try {
      const result = await api.auth.begin2faSetup();
      setSetupResult(result);
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not start 2FA setup');
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup() {
    if (!setupResult) return;
    setBusy(true);
    try {
      const result = await api.auth.confirm2faSetup(confirmCode);
      setBackupCodes(result.backupCodes);
      setSetupResult(null);
      setConfirmCode('');
      const refreshed = await api.auth.me();
      setUser(refreshed.user);
      toast.success('Two-factor authentication is now enabled');
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Invalid code, try again');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      await api.auth.disable2fa(disablePassword);
      setShowDisable(false);
      setDisablePassword('');
      const refreshed = await api.auth.me();
      setUser(refreshed.user);
      toast.success('Two-factor authentication disabled');
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not disable 2FA');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            <h2 className="text-lg font-display font-semibold tracking-tight">Two-factor authentication</h2>
            {enabled ? (
              <Badge variant="success">Enabled</Badge>
            ) : (
              <Badge variant="muted">Not enabled</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Protect your account with a one-time code from an authenticator app like 1Password,
            Authy, or Google Authenticator.
          </p>
        </div>
        {!enabled ? (
          <Button onClick={beginSetup} loading={busy && !setupResult}>
            Enable
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowDisable(true)}>
            Disable
          </Button>
        )}
      </header>

      {backupCodes ? (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-4">
          <p className="text-sm font-semibold text-success">Save your backup codes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Each code can be used once if you lose access to your authenticator. Store them in a
            password manager.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-4">
            {backupCodes.map((code) => (
              <li
                key={code}
                className="rounded-md border border-border bg-background px-2 py-1 text-center"
              >
                {code}
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => setBackupCodes(null)}
          >
            Got it
          </Button>
        </div>
      ) : null}

      {/* Setup dialog */}
      <Dialog open={Boolean(setupResult)} onOpenChange={(open) => {
        if (!open) {
          setSetupResult(null);
          setConfirmCode('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up authenticator app</DialogTitle>
            <DialogDescription>
              Scan the QR code in your authenticator app, then enter the 6-digit code to confirm.
            </DialogDescription>
          </DialogHeader>
          {setupResult ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs">
                <p className="font-medium text-foreground">Manual entry secret</p>
                <p className="mt-1 break-all font-mono text-muted-foreground">
                  {setupResult.secret}
                </p>
              </div>
              <FormField id="totp-confirm" label="6-digit code" required>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmCode}
                  onChange={(event) => setConfirmCode(event.target.value)}
                />
              </FormField>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <Spinner aria-label="Generating secret" />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setSetupResult(null);
                setConfirmCode('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmSetup} loading={busy} disabled={confirmCode.length !== 6}>
              Verify & enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={showDisable} onOpenChange={setShowDisable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication?</DialogTitle>
            <DialogDescription>
              Confirm your account password to disable 2FA. You can re-enable it any time.
            </DialogDescription>
          </DialogHeader>
          <FormField id="disable-password" label="Account password" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={disablePassword}
              onChange={(event) => setDisablePassword(event.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDisable(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={disable}
              loading={busy}
              disabled={disablePassword.length === 0}
            >
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
