'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input, RadioGroup, RadioGroupItem, Label } from '@twinspire/ui';
import { useForm } from 'react-hook-form';

import { shippingSchema, type ShippingFormValues } from './checkout-schemas';

export interface ShippingFormProps {
  defaultValues?: Partial<ShippingFormValues>;
  onSubmit: (values: ShippingFormValues) => void | Promise<void>;
}

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard (2-3 business days)', price: 'Free over $99' },
  { id: 'express', label: 'Express (next business day)', price: '$14.95' },
  { id: 'overnight', label: 'Overnight (by 12pm tomorrow)', price: '$24.95' },
] as const;

export function ShippingForm({ defaultValues, onSubmit }: ShippingFormProps) {
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: 'United States',
      shippingMethod: 'standard',
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const shippingMethod = watch('shippingMethod');

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="firstName" label="First name" error={errors.firstName?.message}>
            <Input autoComplete="given-name" {...register('firstName')} />
          </FormField>
          <FormField id="lastName" label="Last name" error={errors.lastName?.message}>
            <Input autoComplete="family-name" {...register('lastName')} />
          </FormField>
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register('email')} />
          </FormField>
          <FormField id="phone" label="Phone" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" {...register('phone')} />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Shipping address
        </legend>
        <FormField id="line1" label="Street address" error={errors.line1?.message}>
          <Input autoComplete="address-line1" {...register('line1')} />
        </FormField>
        <FormField
          id="line2"
          label="Apartment, suite, etc. (optional)"
          error={errors.line2?.message}
        >
          <Input autoComplete="address-line2" {...register('line2')} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="city" label="City" error={errors.city?.message}>
            <Input autoComplete="address-level2" {...register('city')} />
          </FormField>
          <FormField id="state" label="State / Region" error={errors.state?.message}>
            <Input autoComplete="address-level1" {...register('state')} />
          </FormField>
          <FormField id="postalCode" label="Postal code" error={errors.postalCode?.message}>
            <Input autoComplete="postal-code" {...register('postalCode')} />
          </FormField>
        </div>
        <FormField id="country" label="Country" error={errors.country?.message}>
          <Input autoComplete="country-name" {...register('country')} />
        </FormField>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Shipping method
        </legend>
        <RadioGroup
          value={shippingMethod}
          onValueChange={(value) =>
            setValue('shippingMethod', value as ShippingFormValues['shippingMethod'])
          }
          className="space-y-2"
        >
          {SHIPPING_OPTIONS.map((option) => (
            <Label
              key={option.id}
              htmlFor={`shipping-${option.id}`}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 has-[input:checked]:border-primary"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem id={`shipping-${option.id}`} value={option.id} />
                <span className="text-sm font-medium">{option.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{option.price}</span>
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting}>
          Continue to payment
        </Button>
      </div>
    </form>
  );
}
