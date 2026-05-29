'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input, Textarea } from '@twinspire/ui';
import { useForm } from 'react-hook-form';

import { shippingSchema, type ShippingFormValues } from './checkout-schemas';

export interface ShippingFormProps {
  defaultValues?: Partial<ShippingFormValues>;
  onSubmit: (values: ShippingFormValues) => void | Promise<void>;
}

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Western North',
  'Central',
  'Eastern',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
] as const;

export function ShippingForm({ defaultValues, onSubmit }: ShippingFormProps) {
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: 'Ghana',
      state: 'Greater Accra',
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset className="space-y-4">
        <legend className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
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
          <FormField
            id="phone"
            label="Phone (Ghana)"
            description="We'll call this number to confirm your order and arrange delivery."
            error={errors.phone?.message}
          >
            <Input
              type="tel"
              autoComplete="tel"
              placeholder="+233 24 555 0123"
              {...register('phone')}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          Delivery address
        </legend>
        <FormField
          id="line1"
          label="Street, GhanaPostGPS, or landmark"
          description="Plot number and street, your GhanaPostGPS code, or a clear nearby landmark."
          error={errors.line1?.message}
        >
          <Input autoComplete="address-line1" {...register('line1')} />
        </FormField>
        <FormField
          id="line2"
          label="Apartment, suite, or directions (optional)"
          error={errors.line2?.message}
        >
          <Textarea
            rows={2}
            placeholder="e.g. House on the right after the blue gate, ring the bell."
            {...register('line2')}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="city" label="City / Town" error={errors.city?.message}>
            <Input autoComplete="address-level2" {...register('city')} />
          </FormField>
          <FormField id="state" label="Region" error={errors.state?.message}>
            <select
              {...register('state')}
              autoComplete="address-level1"
              className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              {GHANA_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            id="postalCode"
            label="Digital address (optional)"
            error={errors.postalCode?.message}
          >
            <Input
              autoComplete="postal-code"
              placeholder="GA-184-8888"
              {...register('postalCode')}
            />
          </FormField>
        </div>
        {/* Country is locked — Twinspire operates only in Ghana. */}
        <input type="hidden" value="Ghana" {...register('country')} />
      </fieldset>

      <p className="border-primary/15 bg-primary/5 text-muted-foreground rounded-md border p-3 text-xs">
        After payment our team will call you on the number above to confirm the order and arrange
        delivery anywhere in Ghana. Pickup at our Accra store is also available — just let the agent
        know on the call.
      </p>

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting}>
          Continue to payment
        </Button>
      </div>
    </form>
  );
}
