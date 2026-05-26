'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Switch,
  Textarea,
} from '@twinspire/ui';
import type { Coupon } from '@twinspire/types';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { z } from 'zod';

const couponSchema = z.object({
  code: z
    .string()
    .min(2, 'Code is required')
    .max(48)
    .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, dash, or underscore'),
  description: z.string().max(480).optional().or(z.literal('')),
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'bogo']),
  value: z.coerce.number().min(0),
  currency: z.string().length(3).optional().or(z.literal('')),
  minSubtotal: z.coerce.number().min(0).optional().or(z.literal('').transform(() => undefined)),
  usageLimit: z.coerce.number().int().min(1).optional().or(z.literal('').transform(() => undefined)),
  usageLimitPerUser: z.coerce.number().int().min(1).optional().or(z.literal('').transform(() => undefined)),
  startsAt: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
  stackable: z.boolean(),
  firstOrderOnly: z.boolean(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

export interface CouponFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon;
  submitting?: boolean;
  onSubmit: (values: CouponFormValues) => Promise<void> | void;
}

const TYPE_OPTIONS: Array<{ value: Coupon['type']; label: string; help: string }> = [
  { value: 'percentage', label: 'Percentage off', help: 'Value is % (1-100).' },
  { value: 'fixed', label: 'Fixed amount off', help: 'Value is in the chosen currency.' },
  { value: 'free_shipping', label: 'Free shipping', help: 'Value is ignored.' },
  { value: 'bogo', label: 'Buy one, get one', help: 'Value applies to discounted item.' },
];

function toDateInput(iso?: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function CouponFormSheet({ open, onOpenChange, coupon, submitting, onSubmit }: CouponFormSheetProps) {
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      description: '',
      type: 'percentage',
      value: 10,
      currency: 'USD',
      minSubtotal: undefined,
      usageLimit: undefined,
      usageLimitPerUser: undefined,
      startsAt: toDateInput(new Date().toISOString()),
      expiresAt: '',
      isActive: true,
      stackable: false,
      firstOrderOnly: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      code: coupon?.code ?? '',
      description: coupon?.description ?? '',
      type: coupon?.type ?? 'percentage',
      value: coupon?.value ?? 10,
      currency: coupon?.currency ?? 'USD',
      minSubtotal: coupon?.minSubtotal?.amount,
      usageLimit: coupon?.usageLimit,
      usageLimitPerUser: coupon?.usageLimitPerUser,
      startsAt: toDateInput(coupon?.startsAt ?? new Date().toISOString()),
      expiresAt: toDateInput(coupon?.expiresAt),
      isActive: coupon?.isActive ?? true,
      stackable: coupon?.stackable ?? false,
      firstOrderOnly: coupon?.firstOrderOnly ?? false,
    });
  }, [open, coupon, form]);

  const watchType = form.watch('type');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{coupon ? `Edit ${coupon.code}` : 'New coupon'}</SheetTitle>
          <SheetDescription>
            {coupon
              ? 'Update the coupon details below. Existing redemptions are preserved.'
              : 'Coupons can be activated, paused, or scoped to first-time customers.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            void form.handleSubmit(async (values) => {
              await onSubmit(values);
            })(e);
          }}
          className="mt-4 space-y-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="code" label="Code" required error={form.formState.errors.code?.message}>
              <Input className="uppercase" {...form.register('code')} />
            </FormField>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormField id="type" label="Type" description={TYPE_OPTIONS.find((t) => t.value === field.value)?.help}>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          </div>

          <FormField id="description" label="Description">
            <Textarea rows={2} placeholder="What is this coupon for?" {...form.register('description')} />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-3">
            <FormField id="value" label="Value" required error={form.formState.errors.value?.message}>
              <Input type="number" min={0} step="0.01" {...form.register('value')} />
            </FormField>
            <FormField id="currency" label="Currency" description="3 letter ISO code">
              <Input maxLength={3} disabled={watchType === 'free_shipping' || watchType === 'percentage'} {...form.register('currency')} />
            </FormField>
            <FormField id="minSubtotal" label="Min subtotal" description="Applies to total before discounts">
              <Input type="number" min={0} step="0.01" {...form.register('minSubtotal')} />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="usageLimit" label="Usage limit">
              <Input type="number" min={1} step="1" {...form.register('usageLimit')} />
            </FormField>
            <FormField id="usageLimitPerUser" label="Per user limit">
              <Input type="number" min={1} step="1" {...form.register('usageLimitPerUser')} />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="startsAt" label="Starts at">
              <Input type="date" {...form.register('startsAt')} />
            </FormField>
            <FormField id="expiresAt" label="Expires at" description="Empty = no expiry">
              <Input type="date" {...form.register('expiresAt')} />
            </FormField>
          </div>

          <div className="grid gap-3 rounded-lg border border-border bg-card/60 p-3">
            {[
              { key: 'isActive', label: 'Active' },
              { key: 'stackable', label: 'Stackable with other coupons' },
              { key: 'firstOrderOnly', label: 'First-order customers only' },
            ].map((opt) => (
              <Controller
                key={opt.key}
                control={form.control}
                name={opt.key as 'isActive' | 'stackable' | 'firstOrderOnly'}
                render={({ field }) => (
                  <label className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{opt.label}</span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Save coupon
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
