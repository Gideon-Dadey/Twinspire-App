'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, FormField, Input, Label } from '@twinspire/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores/auth-store';

import { loginSchema, type LoginFormValues } from './auth-schemas';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/account' }: LoginFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [needsTotp, setNeedsTotp] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
      totpCode: '',
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await api.auth.login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        totpCode: values.totpCode?.trim() || undefined,
      });
      setUser(result.user);
      toast.success(`Welcome back, ${result.user.firstName}`);
      router.push(redirectTo);
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Could not sign in';
      const code = err instanceof ApiError ? err.code : (err as { code?: string }).code;

      if (code === 'TOTP_REQUIRED' || code === 'INVALID_TOTP') {
        setNeedsTotp(true);
        toast.message('Two-factor required', {
          description: 'Enter the 6-digit code from your authenticator app.',
        });
        return;
      }
      toast.error(message);
    }
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <FormField id="login-email" label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      <FormField
        id="login-password"
        label={
          <span className="flex items-center justify-between">
            <span>Password</span>
            <Link
              href="/forgot-password"
              className="text-primary text-xs font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </span>
        }
        required
        error={errors.password?.message}
      >
        <Input type="password" autoComplete="current-password" {...register('password')} />
      </FormField>
      {needsTotp ? (
        <FormField
          id="login-totp"
          label="Two-factor code"
          description="Open your authenticator app and enter the 6-digit code."
          error={errors.totpCode?.message}
        >
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            autoComplete="one-time-code"
            {...register('totpCode')}
          />
        </FormField>
      ) : null}

      <div className="flex items-center justify-between">
        <Label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={rememberMe ?? false}
            onCheckedChange={(checked) => {
              setValue('rememberMe', checked === true);
            }}
          />
          Keep me signed in
        </Label>
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} fullWidth>
        Sign in
      </Button>
    </form>
  );
}
