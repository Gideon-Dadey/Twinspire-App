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
} from '@twinspire/ui';
import type { Address } from '@twinspire/types';
import { MapPin } from 'lucide-react';

import { useDeleteAddress, useSetDefaultAddress } from '@/lib/hooks/use-addresses';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const setDefault = useSetDefaultAddress();
  const remove = useDeleteAddress();

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4 text-primary" aria-hidden />
            {address.label ?? `${address.firstName} ${address.lastName}`}
            {address.isDefault ? <Badge variant="success">Default</Badge> : null}
          </p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {address.kind === 'both' ? 'Shipping & billing' : address.kind}
          </p>
        </div>
      </header>

      <address className="not-italic text-sm leading-relaxed text-muted-foreground">
        <p>{address.firstName} {address.lastName}</p>
        {address.company ? <p>{address.company}</p> : null}
        <p>{address.line1}</p>
        {address.line2 ? <p>{address.line2}</p> : null}
        <p>
          {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}
        </p>
        <p>{address.country}</p>
        <p className="mt-2 text-xs">{address.phone}</p>
      </address>

      <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button variant="outline" size="sm" onClick={() => onEdit(address)}>
          Edit
        </Button>
        {!address.isDefault ? (
          <Button
            variant="ghost"
            size="sm"
            loading={setDefault.isPending && setDefault.variables === address.id}
            onClick={() => setDefault.mutate(address.id)}
          >
            Set default
          </Button>
        ) : null}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive">
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this address?</AlertDialogTitle>
              <AlertDialogDescription>
                You can re-add it later. Existing orders shipped to this address are unaffected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => remove.mutate(address.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </footer>
    </article>
  );
}
