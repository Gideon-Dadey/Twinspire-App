'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  FormField,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@twinspire/ui';
import type { Address, AddressInput } from '@twinspire/types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  label: z.string().max(64).optional().or(z.literal('')),
  kind: z.enum(['shipping', 'billing', 'both']).default('both'),
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  phone: z.string().min(4, 'Phone is required').max(32),
  company: z.string().max(120).optional().or(z.literal('')),
  line1: z.string().min(1, 'Street address is required').max(240),
  line2: z.string().max(240).optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(120),
  state: z.string().max(120).optional().or(z.literal('')),
  postalCode: z.string().min(1, 'Postal code is required').max(32),
  country: z.string().min(1, 'Country is required').max(120),
  countryCode: z.string().length(2, 'ISO country code'),
  isDefault: z.boolean().optional().default(false),
});

type Values = z.infer<typeof schema>;

interface AddressFormProps {
  initial?: Address;
  onSubmit: (input: AddressInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const KINDS = [
  { value: 'both', label: 'Shipping & billing' },
  { value: 'shipping', label: 'Shipping only' },
  { value: 'billing', label: 'Billing only' },
] as const;

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save address',
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          label: initial.label ?? '',
          kind: initial.kind,
          firstName: initial.firstName,
          lastName: initial.lastName,
          phone: initial.phone,
          company: initial.company ?? '',
          line1: initial.line1,
          line2: initial.line2 ?? '',
          city: initial.city,
          state: initial.state ?? '',
          postalCode: initial.postalCode,
          country: initial.country,
          countryCode: initial.countryCode,
          isDefault: initial.isDefault,
        }
      : {
          label: '',
          kind: 'both',
          firstName: '',
          lastName: '',
          phone: '',
          company: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          countryCode: 'US',
          isDefault: false,
        },
  });

  useEffect(() => {
    if (!initial) reset();
  }, [initial, reset]);

  const kind = watch('kind');
  const isDefault = watch('isDefault');

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      label: values.label?.trim() || undefined,
      kind: values.kind,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      company: values.company?.trim() || undefined,
      line1: values.line1,
      line2: values.line2?.trim() || undefined,
      city: values.city,
      state: values.state?.trim() || undefined,
      postalCode: values.postalCode,
      country: values.country,
      countryCode: values.countryCode.toUpperCase(),
      isDefault: values.isDefault,
    });
  });

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="addr-label" label="Label" description="e.g. Home or Office" error={errors.label?.message}>
          <Input placeholder="Home" {...register('label')} />
        </FormField>
        <FormField id="addr-kind" label="Use for">
          <Select value={kind} onValueChange={(v) => setValue('kind', v as Values['kind'])}>
            <SelectTrigger>
              <SelectValue placeholder="Use for" />
            </SelectTrigger>
            <SelectContent>
              {KINDS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="addr-first" label="First name" required error={errors.firstName?.message}>
          <Input autoComplete="given-name" {...register('firstName')} />
        </FormField>
        <FormField id="addr-last" label="Last name" required error={errors.lastName?.message}>
          <Input autoComplete="family-name" {...register('lastName')} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="addr-company" label="Company" error={errors.company?.message}>
          <Input autoComplete="organization" {...register('company')} />
        </FormField>
        <FormField id="addr-phone" label="Phone" required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...register('phone')} />
        </FormField>
      </div>
      <FormField id="addr-line1" label="Street address" required error={errors.line1?.message}>
        <Input autoComplete="address-line1" {...register('line1')} />
      </FormField>
      <FormField id="addr-line2" label="Apartment / suite" error={errors.line2?.message}>
        <Input autoComplete="address-line2" {...register('line2')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="addr-city" label="City" required error={errors.city?.message}>
          <Input autoComplete="address-level2" {...register('city')} />
        </FormField>
        <FormField id="addr-state" label="State / region" error={errors.state?.message}>
          <Input autoComplete="address-level1" {...register('state')} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="addr-postal" label="Postal code" required error={errors.postalCode?.message}>
          <Input autoComplete="postal-code" {...register('postalCode')} />
        </FormField>
        <FormField id="addr-country" label="Country" required error={errors.country?.message}>
          <Input autoComplete="country-name" {...register('country')} />
        </FormField>
        <FormField id="addr-country-code" label="Country code" required error={errors.countryCode?.message}>
          <Input maxLength={2} autoComplete="country" {...register('countryCode')} />
        </FormField>
      </div>
      <Label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={Boolean(isDefault)}
          onCheckedChange={(checked) => setValue('isDefault', checked === true)}
        />
        Set as default address
      </Label>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
