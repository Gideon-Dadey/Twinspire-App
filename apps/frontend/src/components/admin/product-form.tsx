'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
  Button,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  cn,
} from '@twinspire/ui';
import type { Product } from '@twinspire/types';
import { Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useAdminBrands,
  useAdminCategories,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
} from '@/lib/hooks/use-admin';
import { useSession } from '@/lib/hooks/use-session';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required').max(160),
  slug: z
    .string()
    .max(160)
    .regex(/^[a-z0-9-]*$/i, 'Use lowercase letters, numbers and dashes')
    .optional()
    .or(z.literal('')),
  sku: z.string().min(2, 'SKU is required').max(40),
  brandId: z.string().min(1, 'Brand is required'),
  primaryCategoryId: z.string().min(1, 'Category is required'),
  shortDescription: z.string().max(280).optional().or(z.literal('')),
  description: z.string().min(20, 'Description should be at least 20 characters').max(8000),
  status: z.enum(['draft', 'published', 'archived', 'out_of_stock']),
  stockStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'backorder', 'preorder']),
  condition: z.enum(['new', 'refurbished', 'used', 'open_box']),
  priceAmount: z.coerce.number().min(0),
  priceCompareAt: z.coerce.number().min(0).optional().or(z.literal('').transform(() => undefined)),
  priceCurrency: z.string().length(3),
  imageUrl: z.string().url('Provide a valid image URL').optional().or(z.literal('')),
  imageAlt: z.string().max(200).optional().or(z.literal('')),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  isNewArrival: z.boolean(),
  tags: z.string().max(400).optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
}

const STATUS_OPTIONS: Array<{ value: ProductFormValues['status']; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'out_of_stock', label: 'Out of stock' },
];

const STOCK_OPTIONS: Array<{ value: ProductFormValues['stockStatus']; label: string }> = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'backorder', label: 'Backorder' },
  { value: 'preorder', label: 'Pre-order' },
];

const CONDITION_OPTIONS: Array<{ value: ProductFormValues['condition']; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'used', label: 'Used' },
  { value: 'open_box', label: 'Open box' },
];

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const { user } = useSession();
  const canDelete = user?.role === 'admin' || user?.role === 'superadmin';

  const brands = useAdminBrands();
  const categories = useAdminCategories();

  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct(product?.id ?? '');
  const deleteMutation = useDeleteAdminProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      sku: product?.sku ?? '',
      brandId: product?.brandId ?? '',
      primaryCategoryId: product?.primaryCategoryId ?? '',
      shortDescription: product?.shortDescription ?? '',
      description: product?.description ?? '',
      status: product?.status ?? 'draft',
      stockStatus: product?.stockStatus ?? 'in_stock',
      condition: product?.condition ?? 'new',
      priceAmount: product?.price.amount ?? 0,
      priceCompareAt: product?.price.compareAtAmount ?? undefined,
      priceCurrency: product?.price.currency ?? 'USD',
      imageUrl: product?.images[0]?.url ?? '',
      imageAlt: product?.images[0]?.alt ?? '',
      isFeatured: product?.isFeatured ?? false,
      isBestSeller: product?.isBestSeller ?? false,
      isNewArrival: product?.isNewArrival ?? false,
      tags: product?.tags.join(', ') ?? '',
    },
  });

  const imageUrl = form.watch('imageUrl');
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug?.trim() ? values.slug.trim() : undefined,
      sku: values.sku,
      brandId: values.brandId,
      primaryCategoryId: values.primaryCategoryId,
      categoryIds: [values.primaryCategoryId],
      shortDescription: values.shortDescription || undefined,
      description: values.description,
      status: values.status,
      stockStatus: values.stockStatus,
      condition: values.condition,
      price: {
        amount: values.priceAmount,
        currency: values.priceCurrency.toUpperCase() as Product['price']['currency'],
        compareAtAmount: typeof values.priceCompareAt === 'number' ? values.priceCompareAt : undefined,
      },
      imageUrl: values.imageUrl || undefined,
      imageAlt: values.imageAlt || undefined,
      isFeatured: values.isFeatured,
      isBestSeller: values.isBestSeller,
      isNewArrival: values.isNewArrival,
      tags: values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (mode === 'create') {
        const res = await createMutation.mutateAsync(payload);
        router.push(`/admin/products/${res.product.id}`);
      } else if (product) {
        await updateMutation.mutateAsync(payload);
      }
    } catch {
      // mutation hook surfaces a toast
    }
  }

  async function handleDelete() {
    if (!product) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      router.push('/admin/products');
    } catch {
      // toast already
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void form.handleSubmit(onSubmit)(e);
      }}
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-sm font-semibold">Basic info</h2>
            <p className="text-xs text-muted-foreground">Required for storefront listing.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="name" label="Name" required error={form.formState.errors.name?.message}>
              <Input placeholder="Aurora X Pro headphones" {...form.register('name')} />
            </FormField>
            <FormField id="sku" label="SKU" required error={form.formState.errors.sku?.message}>
              <Input placeholder="AUR-XPRO-BLK" {...form.register('sku')} />
            </FormField>
            <FormField id="slug" label="Slug" error={form.formState.errors.slug?.message} description="Auto-generated from name when empty.">
              <Input placeholder="aurora-x-pro-headphones" {...form.register('slug')} />
            </FormField>
            <FormField id="tags" label="Tags" description="Comma separated">
              <Input placeholder="audio, new arrival" {...form.register('tags')} />
            </FormField>
          </div>
          <FormField id="shortDescription" label="Short description" description="Shown in listings + cart.">
            <Textarea rows={2} placeholder="Studio-grade ANC headphones with 40-hour battery." {...form.register('shortDescription')} />
          </FormField>
          <FormField id="description" label="Description" required error={form.formState.errors.description?.message}>
            <Textarea rows={8} {...form.register('description')} />
          </FormField>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-sm font-semibold">Pricing</h2>
            <p className="text-xs text-muted-foreground">Storefront price + optional compare-at.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="priceAmount" label="Price" required error={form.formState.errors.priceAmount?.message}>
              <Input type="number" inputMode="decimal" step="0.01" min={0} {...form.register('priceAmount')} />
            </FormField>
            <FormField id="priceCompareAt" label="Compare at" description="Strikethrough price (optional).">
              <Input type="number" inputMode="decimal" step="0.01" min={0} {...form.register('priceCompareAt')} />
            </FormField>
            <FormField id="priceCurrency" label="Currency" required>
              <Input maxLength={3} {...form.register('priceCurrency')} />
            </FormField>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-sm font-semibold">Media</h2>
            <p className="text-xs text-muted-foreground">Primary image used in listings and cards.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div className="space-y-3">
              <FormField id="imageUrl" label="Primary image URL" error={form.formState.errors.imageUrl?.message}>
                <Input placeholder="https://images.unsplash.com/…" {...form.register('imageUrl')} />
              </FormField>
              <FormField id="imageAlt" label="Alt text">
                <Input placeholder="Aurora X Pro headphones in matte black" {...form.register('imageAlt')} />
              </FormField>
            </div>
            <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-background">
              {imageUrl ? (
                <span className="relative block h-full w-full">
                  <Image src={imageUrl} alt={form.watch('imageAlt') || 'Preview'} fill sizes="180px" className="object-contain" />
                </span>
              ) : (
                <p className="px-3 text-center text-xs text-muted-foreground">Image preview</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-sm font-semibold">Organisation</h2>
          </div>
          <Controller
            control={form.control}
            name="brandId"
            render={({ field, fieldState }) => (
              <FormField id="brandId" label="Brand" required error={fieldState.error?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Choose a brand" /></SelectTrigger>
                  <SelectContent>
                    {(brands.data?.items ?? []).map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="primaryCategoryId"
            render={({ field, fieldState }) => (
              <FormField id="primaryCategoryId" label="Primary category" required error={fieldState.error?.message}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                  <SelectContent>
                    {(categories.data?.items ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
        </section>

        <section className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-sm font-semibold">Status & inventory</h2>
          </div>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormField id="status" label="Publication status">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="stockStatus"
            render={({ field }) => (
              <FormField id="stockStatus" label="Stock status">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STOCK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormField id="condition" label="Condition">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
          />
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Storefront badges</h2>
          {(['isFeatured', 'isBestSeller', 'isNewArrival'] as const).map((key) => (
            <Controller
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">
                    {key === 'isFeatured'
                      ? 'Featured'
                      : key === 'isBestSeller'
                        ? 'Best seller'
                        : 'New arrival'}
                  </span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          ))}
        </section>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5">
          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={() => router.push('/admin/products')}>
            Cancel
          </Button>
          {mode === 'edit' && product ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  className={cn('text-destructive hover:bg-destructive/10', !canDelete && 'opacity-60')}
                  disabled={!canDelete || deleteMutation.isPending}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete product
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete “{product.name}”?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone. Existing orders that reference this product will keep their
                    snapshot.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void handleDelete()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {!canDelete && mode === 'edit' ? (
            <p className="text-[11px] text-muted-foreground">
              Only admins can delete products. Ask an admin to remove this one.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
