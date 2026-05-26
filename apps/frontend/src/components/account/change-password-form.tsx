'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input } from '@twinspire/ui';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/components/auth/auth-schemas';
import { PasswordStrengthMeter } from '@/components/auth/password-strength';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';

export function ChangePasswordForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const password = watch('newPassword');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.auth.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated. Sign in again with your new password.');
      setUser(null);
      reset();
      router.push('/login');
    } catch (err) {
      toast.error((err as { message?: string }).message ?? 'Could not change password');
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <FormField
        id="security-current-password"
        label="Current password"
        required
        error={errors.currentPassword?.message}
      >
        <Input type="password" autoComplete="current-password" {...register('currentPassword')} />
      </FormField>
      <FormField
        id="security-new-password"
        label="New password"
        required
        error={errors.newPassword?.message}
      >
        <Input type="password" autoComplete="new-password" {...register('newPassword')} />
      </FormField>
      <PasswordStrengthMeter password={password ?? ''} />
      <FormField
        id="security-confirm-password"
        label="Confirm new password"
        required
        error={errors.confirmPassword?.message}
      >
        <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Update password
        </Button>
      </div>
    </form>
  );
}
