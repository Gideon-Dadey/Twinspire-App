'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Skeleton,
} from '@twinspire/ui';
import type { Address } from '@twinspire/types';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

import { AccountPageHeader } from '@/components/account/account-page-header';
import { AddressCard } from '@/components/account/address-card';
import { AddressForm } from '@/components/account/address-form';
import {
  useAddressesQuery,
  useCreateAddress,
  useUpdateAddress,
} from '@/lib/hooks/use-addresses';

export function AddressesPageContent() {
  const { data, isLoading } = useAddressesQuery();
  const create = useCreateAddress();
  const update = useUpdateAddress();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  return (
    <div className="space-y-8">
      <AccountPageHeader
        eyebrow="Account"
        title="Saved addresses"
        description="Speed up checkout by saving shipping and billing destinations."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus aria-hidden />
            Add new
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : data?.addresses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.addresses.map((address) => (
            <AddressCard key={address.id} address={address} onEdit={(addr) => setEditing(addr)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Save your home or office address so checkout fills in automatically."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus aria-hidden />
              Add an address
            </Button>
          }
        />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add address</DialogTitle>
            <DialogDescription>
              Saved addresses are auto-selected during checkout.
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            isSubmitting={create.isPending}
            onCancel={() => setShowCreate(false)}
            onSubmit={async (input) => {
              await create.mutateAsync(input);
              setShowCreate(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit address</DialogTitle>
            <DialogDescription>Update or change the default status.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <AddressForm
              initial={editing}
              isSubmitting={update.isPending}
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
              onSubmit={async (input) => {
                await update.mutateAsync({ id: editing.id, input });
                setEditing(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
