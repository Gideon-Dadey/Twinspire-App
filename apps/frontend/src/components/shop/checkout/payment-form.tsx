'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  FormField,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@twinspire/ui';
import { CreditCard, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { paymentSchema, type PaymentFormValues } from './checkout-schemas';

export interface PaymentFormProps {
  defaultValues?: Partial<PaymentFormValues>;
  onSubmit: (values: PaymentFormValues) => void | Promise<void>;
  onBack: () => void;
}

/**
 * Three providers, primary listed first for Ghana:
 *  - paystack: mobile money + local cards + bank (the default)
 *  - card:     Stripe Visa/Mastercard for international cards
 *  - paypal:   for diaspora customers paying from abroad
 */
const PAYSTACK_CHANNELS = [
  { id: 'momo' as const, label: 'Mobile money', hint: 'MTN · Vodafone · AirtelTigo' },
  { id: 'card' as const, label: 'Card', hint: 'Visa · Mastercard · Verve' },
  { id: 'bank' as const, label: 'Bank transfer', hint: 'Online or USSD' },
];

export function PaymentForm({ defaultValues, onSubmit, onBack }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'paystack',
      paystackChannel: 'momo',
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

  const method = watch('method');
  const paystackChannel = watch('paystackChannel');

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <fieldset className="space-y-3">
        <legend className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          Payment method
        </legend>
        <RadioGroup
          value={method}
          onValueChange={(value) => setValue('method', value as PaymentFormValues['method'])}
          className="space-y-2"
        >
          {/* Paystack — Ghana primary */}
          <Label
            htmlFor="payment-paystack"
            className="border-border bg-card hover:border-primary/40 has-[input:checked]:border-primary flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors"
          >
            <RadioGroupItem id="payment-paystack" value="paystack" />
            <Smartphone className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 text-sm font-medium">
              Mobile money &amp; local card
            </span>
            <span className="bg-primary/10 text-primary inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              Paystack
            </span>
          </Label>

          {/* Stripe card */}
          <Label
            htmlFor="payment-card"
            className="border-border bg-card hover:border-primary/40 has-[input:checked]:border-primary flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors"
          >
            <RadioGroupItem id="payment-card" value="card" />
            <CreditCard className="text-muted-foreground size-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 text-sm font-medium">International card</span>
            <span className="text-muted-foreground shrink-0 text-xs">Visa · Mastercard · Amex</span>
          </Label>

          {/* PayPal */}
          <Label
            htmlFor="payment-paypal"
            className="border-border bg-card hover:border-primary/40 has-[input:checked]:border-primary flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors"
          >
            <RadioGroupItem id="payment-paypal" value="paypal" />
            <span className="bg-secondary text-secondary-foreground inline-flex h-5 w-12 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold uppercase tracking-wider">
              PayPal
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">Pay with PayPal</span>
            <span className="text-muted-foreground shrink-0 text-xs">Redirected on next step</span>
          </Label>
        </RadioGroup>
      </fieldset>

      {method === 'paystack' && (
        <fieldset className="border-primary/15 bg-primary/5 space-y-3 rounded-lg border p-4">
          <legend className="text-primary px-2 text-sm font-semibold uppercase tracking-wide">
            Paystack channel
          </legend>
          <p className="text-muted-foreground text-xs">
            Pick how you want to pay. You&apos;ll complete the actual transaction on Paystack&apos;s
            secure page on the next step.
          </p>
          <RadioGroup
            value={paystackChannel ?? 'momo'}
            onValueChange={(v) =>
              setValue('paystackChannel', v as NonNullable<PaymentFormValues['paystackChannel']>)
            }
            className="grid gap-2 sm:grid-cols-3"
          >
            {PAYSTACK_CHANNELS.map((ch) => (
              <Label
                key={ch.id}
                htmlFor={`paystack-${ch.id}`}
                className="border-border bg-background hover:border-primary/40 has-[input:checked]:border-primary has-[input:checked]:bg-primary/10 flex cursor-pointer flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors"
              >
                <span className="flex items-center gap-2">
                  <RadioGroupItem id={`paystack-${ch.id}`} value={ch.id} />
                  <span className="text-sm font-medium">{ch.label}</span>
                </span>
                <span className="text-muted-foreground pl-6 text-[11px]">{ch.hint}</span>
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {method === 'card' && (
        <fieldset className="space-y-4">
          <legend className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
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

      <div className="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-lg border p-3 text-xs">
        <ShieldCheck className="size-4 shrink-0" aria-hidden />
        <span>
          Your payment is encrypted in transit and processed by Paystack, Stripe, or PayPal — never
          stored on TwinSpire servers.
        </span>
      </div>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back to delivery
        </Button>
        <Button type="submit" size="lg" loading={isSubmitting} leftIcon={<Lock aria-hidden />}>
          Review order
        </Button>
      </div>
    </form>
  );
}
