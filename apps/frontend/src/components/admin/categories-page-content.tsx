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
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';
import type { AdminCategoryListItem } from '@/lib/api/admin-types';

import { DataTable } from './data-table';
import { TaxonomyFormSheet, type TaxonomyFormValues } from './taxonomy-form-sheet';

export function CategoriesPageContent() {
  const { user } = useSession();
  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  const { data, isLoading } = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryListItem | null>(null);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(category: AdminCategoryListItem) {
    setEditing(category);
    setOpen(true);
  }

  async function handleSubmit(values: TaxonomyFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug?.trim() ? values.slug.trim() : undefined,
      description: values.description || undefined,
      image: values.imageUrl ? { url: values.imageUrl, alt: values.name } : undefined,
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
        <p className="text-sm text-muted-foreground">
          {data?.items.length ?? 0} categories total
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden /> New category
        </Button>
      </div>

      <DataTable
        loading={isLoading}
        rowKey={(c) => c.id}
        rows={data?.items ?? []}
        columns={[
          {
            id: 'name',
            header: 'Category',
            cell: (c) => (
              <div className="min-w-0">
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">/{c.slug}</p>
              </div>
            ),
          },
          {
            id: 'parent',
            header: 'Parent',
            cell: (c) => (
              <span className="text-muted-foreground">
                {c.parentId ? data?.items.find((p) => p.id === c.parentId)?.name ?? c.parentId : '—'}
              </span>
            ),
          },
          {
            id: 'products',
            header: 'Products',
            align: 'right',
            cell: (c) => <span className="font-medium">{c.productCount}</span>,
          },
          {
            id: 'flags',
            header: 'Flags',
            cell: (c) => (
              <div className="flex gap-1">
                {c.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                {c.isActive ? (
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
            cell: (c) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" aria-label={`Edit ${c.name}`} onClick={() => openEdit(c)}>
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${c.name}`}
                      disabled={!canDelete || deleteMutation.isPending}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete “{c.name}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {c.productCount > 0
                          ? `${c.productCount} products reference this category; they will become uncategorised.`
                          : 'This category has no products.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void deleteMutation.mutateAsync(c.id)}>
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
        title={editing ? `Edit ${editing.name}` : 'New category'}
        description={editing ? undefined : 'Categories help shoppers narrow the storefront.'}
        defaultValues={
          editing
            ? {
                name: editing.name,
                slug: editing.slug,
                description: editing.description ?? '',
                imageUrl: editing.image?.url ?? '',
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
