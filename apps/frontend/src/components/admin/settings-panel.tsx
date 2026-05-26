'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Switch,
} from '@twinspire/ui';
import { RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { adminMockBackend } from '@/lib/api/admin-mock-backend';
import { env } from '@/env';

export function SettingsPanel() {
  const usingMock = env.NEXT_PUBLIC_USE_MOCK_API;
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await adminMockBackend._reset();
      toast.success('Mock backend data reset. Refresh to see seed values.');
    } catch (error) {
      toast.error((error as Error).message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Storefront preferences</h2>
          <p className="text-xs text-muted-foreground">Controls for global commerce behavior.</p>
        </div>
        <SettingRow
          label="Send marketing emails"
          description="Allow customers to receive promotional newsletters."
          control={<Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />}
        />
        <SettingRow
          label="Maintenance mode"
          description="Block storefront checkout while you ship updates."
          control={<Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />}
        />
        <p className="text-[11px] text-muted-foreground">
          Settings persist locally in the demo; they map to backend feature flags once Phase 11 ships.
        </p>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Environment</h2>
          <p className="text-xs text-muted-foreground">Where the console is reading data from.</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-sm">
          <div>
            <p className="font-medium">API mode</p>
            <p className="text-xs text-muted-foreground">
              Toggle via <code className="rounded bg-muted px-1 py-0.5 text-[11px]">NEXT_PUBLIC_USE_MOCK_API</code>.
            </p>
          </div>
          {usingMock ? (
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              Mock backend
            </Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Live API
            </Badge>
          )}
        </div>
        <div className="rounded-lg border border-border bg-background p-3 text-sm">
          <p className="font-medium">Reset mock data</p>
          <p className="text-xs text-muted-foreground">
            Clears localStorage seeds. Useful when demoing or debugging.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-3" disabled={!usingMock}>
                <RefreshCcw className="size-4" aria-hidden /> Reset to seed data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset mock backend?</AlertDialogTitle>
                <AlertDialogDescription>
                  All admin-side products, orders, coupons, and reviews you’ve modified will be replaced
                  with the original seed data. Customer accounts you created via /register stay intact.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={resetting} onClick={() => void handleReset()}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {control}
    </div>
  );
}
