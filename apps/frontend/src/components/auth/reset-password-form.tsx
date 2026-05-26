'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input } from '@twinspire/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '@/lib/api';

import { resetPasswordSchema, type ResetPasswordFormValues } from './auth-schemas';
import { PasswordStrengthMeter } from './password-strength';

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.auth.resetPassword({ token, password: values.password });
      toast.success('Password updated — sign in with your new password.');
      router.push('/login');
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Could not reset password';
      toast.error(message);
    }
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      {!token ? (
        <div className="rounded-lg bg-warning/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          No reset token provided. Request a new link from the forgot-password page.
        </div>
      ) : null}
      <FormField id="reset-password" label="New password" required error={errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...register('password')} />
      </FormField>
      <PasswordStrengthMeter password={password ?? ''} />
      <FormField
        id="reset-confirm"
        label="Confirm password"
        required
        error={errors.confirmPassword?.message}
      >
        <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      <Button type="submit" size="lg" loading={isSubmitting} fullWidth disabled={!token}>
        Update password
      </Button>
    </form>
  );
}
