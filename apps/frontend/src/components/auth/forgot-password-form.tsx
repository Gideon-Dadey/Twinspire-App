'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input } from '@twinspire/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { api } from '@/lib/api';

import { forgotPasswordSchema, type ForgotPasswordFormValues } from './auth-schemas';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await api.auth.requestPasswordReset(values.email);
    setSubmitted(true);
  });

  if (submitted) {
    return (
      <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
        <p className="font-medium text-foreground">Check your inbox.</p>
        <p className="text-muted-foreground">
          If an account exists for the email you entered, we&apos;ve sent a link to reset your
          password. The link expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <FormField id="forgot-email" label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
      </FormField>
      <Button type="submit" size="lg" loading={isSubmitting} fullWidth>
        Send reset link
      </Button>
    </form>
  );
}
