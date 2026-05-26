'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input, RadioGroup, RadioGroupItem, Label, Checkbox } from '@twinspire/ui';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { paymentSchema, type PaymentFormValues } from './checkout-schemas';

export interface PaymentFormProps {
  defaultValues?: Partial<PaymentFormValues>;
  onSubmit: (values: PaymentFormValues) => void | Promise<void>;
  onBack: () => void;
}

export function PaymentForm({ defaultValues, onSubmit, onBack }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: 'card', ...defaultValues },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const method = watch('method');

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Payment method
        </legend>
        <RadioGroup
          value={method}
          onValueChange={(value) => setValue('method', value as PaymentFormValues['method'])}
          className="space-y-2"
        >
          <Label
            htmlFor="payment-card"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 has-[input:checked]:border-primary"
          >
            <RadioGroupItem id="payment-card" value="card" />
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">Credit or debit card</span>
            <span className="ml-auto text-xs text-muted-foreground">Visa · Mastercard · Amex</span>
          </Label>
          <Label
            htmlFor="payment-paypal"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 has-[input:checked]:border-primary"
          >
            <RadioGroupItem id="payment-paypal" value="paypal" />
            <span className="inline-flex h-5 w-12 items-center justify-center rounded-sm bg-primary text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              PayPal
            </span>
            <span className="text-sm font-medium">Pay with PayPal</span>
            <span className="ml-auto text-xs text-muted-foreground">Redirected on next step</span>
          </Label>
        </RadioGroup>
      </fieldset>

      {method === 'card' && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Card details
          </legend>
          <FormField id="cardHolder" label="Cardholder name" error={errors.cardHolder?.message}>
            <Input autoComplete="cc-name" {...register('cardHolder')} />
          </FormField>
          <FormField id="cardNumber" label="Card number" error={errors.cardNumber?.message}>
            <Input
              autoComplete="cc-number"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              {...register('cardNumber')}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField id="expMonth" label="Exp. month" error={errors.expMonth?.message}>
              <Input
                autoComplete="cc-exp-month"
                inputMode="numeric"
                placeholder="MM"
                maxLength={2}
                {...register('expMonth')}
              />
            </FormField>
            <FormField id="expYear" label="Exp. year" error={errors.expYear?.message}>
              <Input
                autoComplete="cc-exp-year"
                inputMode="numeric"
                placeholder="YY"
                maxLength={2}
                {...register('expYear')}
              />
            </FormField>
            <FormField id="cvv" label="CVV" error={errors.cvv?.message}>
              <Input
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                {...register('cvv')}
              />
            </FormField>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="save-payment"
              checked={watch('savePaymentMethod') === true}
              onCheckedChange={(state) => setValue('savePaymentMethod', state === true)}
            />
            <Label htmlFor="save-payment" className="text-sm font-normal">
              Save this card for future purchases
            </Label>
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        <span>
          Your payment information is encrypted in transit and never stored on TwinSpire servers.
        </span>
      </div>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back to shipping
        </Button>
        <Button type="submit" size="lg" loading={isSubmitting} leftIcon={<Lock aria-hidden />}>
          Review order
        </Button>
      </div>
    </form>
  );
}
