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
import Image from 'next/image';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { AdminBrandListItem } from '@/lib/api/admin-types';
import {
  useAdminBrands,
  useCreateAdminBrand,
  useDeleteAdminBrand,
  useUpdateAdminBrand,
} from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';

import { DataTable } from './data-table';
import { TaxonomyFormSheet, type TaxonomyFormValues } from './taxonomy-form-sheet';

export function BrandsPageContent() {
  const { user } = useSession();
  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  const { data, isLoading } = useAdminBrands();
  const createMutation = useCreateAdminBrand();
  const updateMutation = useUpdateAdminBrand();
  const deleteMutation = useDeleteAdminBrand();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBrandListItem | null>(null);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(brand: AdminBrandListItem) {
    setEditing(brand);
    setOpen(true);
  }

  async function handleSubmit(values: TaxonomyFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug?.trim() ? values.slug.trim() : undefined,
      description: values.description || undefined,
      logo: values.imageUrl ? { url: values.imageUrl, alt: values.name } : undefined,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, input: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setOpen(false);
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{data?.items.length ?? 0} brands total</p>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden /> New brand
        </Button>
      </div>

      <DataTable
        loading={isLoading}
        rowKey={(b) => b.id}
        rows={data?.items ?? []}
        columns={[
          {
            id: 'name',
            header: 'Brand',
            cell: (b) => (
              <div className="flex items-center gap-3">
                {b.logo?.url ? (
                  <span className="relative size-10 overflow-hidden rounded-md border border-border/60 bg-muted">
                    <Image src={b.logo.url} alt={b.logo.alt ?? b.name} fill sizes="40px" className="object-cover" />
                  </span>
                ) : (
                  <span className="grid size-10 place-items-center rounded-md bg-muted text-xs uppercase text-muted-foreground">
                    {b.name.slice(0, 2)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{b.slug}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'country',
            header: 'Origin',
            cell: (b) => <span className="text-muted-foreground">{b.countryOfOrigin ?? '—'}</span>,
          },
          {
            id: 'products',
            header: 'Products',
            align: 'right',
            cell: (b) => <span className="font-medium">{b.productCount}</span>,
          },
          {
            id: 'flags',
            header: 'Flags',
            cell: (b) => (
              <div className="flex gap-1">
                {b.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                {b.isActive ? (
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            ),
          },
          {
            id: 'actions',
            header: <span className="sr-only">Actions</span>,
            align: 'right',
            cell: (b) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" aria-label={`Edit ${b.name}`} onClick={() => openEdit(b)}>
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${b.name}`}
                      disabled={!canDelete || deleteMutation.isPending}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete “{b.name}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {b.productCount > 0
                          ? `${b.productCount} products are mapped to this brand; they will lose their brand link.`
                          : 'This brand has no products.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void deleteMutation.mutateAsync(b.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
          },
        ]}
      />

      <TaxonomyFormSheet
        open={open}
        onOpenChange={setOpen}
        title={editing ? `Edit ${editing.name}` : 'New brand'}
        imageLabel="Logo URL"
        defaultValues={
          editing
            ? {
                name: editing.name,
                slug: editing.slug,
                description: editing.description ?? '',
                imageUrl: editing.logo?.url ?? '',
                isFeatured: editing.isFeatured,
                isActive: editing.isActive,
              }
            : undefined
        }
        submitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </>
  );
}
