'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  FormField,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Switch,
  Textarea,
} from '@twinspire/ui';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';

export const taxonomyFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(160),
  slug: z
    .string()
    .max(160)
    .regex(/^[a-z0-9-]*$/i, 'Use lowercase letters, numbers and dashes')
    .optional()
    .or(z.literal('')),
  description: z.string().max(800).optional().or(z.literal('')),
  imageUrl: z.string().url('Provide a valid URL').optional().or(z.literal('')),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type TaxonomyFormValues = z.infer<typeof taxonomyFormSchema>;

export interface TaxonomyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  imageLabel?: string;
  defaultValues?: Partial<TaxonomyFormValues>;
  submitting?: boolean;
  onSubmit: (values: TaxonomyFormValues) => Promise<void> | void;
}

export function TaxonomyFormSheet({
  open,
  onOpenChange,
  title,
  description,
  imageLabel = 'Image URL',
  defaultValues,
  submitting,
  onSubmit,
}: TaxonomyFormSheetProps) {
  const form = useForm<TaxonomyFormValues>({
    resolver: zodResolver(taxonomyFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isFeatured: false,
      isActive: true,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        isFeatured: false,
        isActive: true,
        ...defaultValues,
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        <form
          onSubmit={(e) => {
            void form.handleSubmit(async (values) => {
              await onSubmit(values);
            })(e);
          }}
          className="mt-4 space-y-4"
        >
          <FormField id="name" label="Name" required error={form.formState.errors.name?.message}>
            <Input {...form.register('name')} />
          </FormField>
          <FormField id="slug" label="Slug" description="Auto-generated when empty." error={form.formState.errors.slug?.message}>
            <Input {...form.register('slug')} />
          </FormField>
          <FormField id="description" label="Description">
            <Textarea rows={3} {...form.register('description')} />
          </FormField>
          <FormField id="imageUrl" label={imageLabel} error={form.formState.errors.imageUrl?.message}>
            <Input placeholder="https://…" {...form.register('imageUrl')} />
          </FormField>

          <div className="grid gap-3 rounded-xl border border-border bg-card/60 p-3">
            <Controller
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <label className="flex items-center justify-between text-sm">
                  <span>Featured</span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <label className="flex items-center justify-between text-sm">
                  <span>Active</span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
