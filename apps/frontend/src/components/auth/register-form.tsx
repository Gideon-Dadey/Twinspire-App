'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, FormField, Input, Label } from '@twinspire/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';

import { registerSchema, type RegisterFormValues } from './auth-schemas';
import { PasswordStrengthMeter } from './password-strength';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      marketingOptIn: false,
      terms: false as unknown as true,
    },
  });

  const password = watch('password');
  const marketingOptIn = watch('marketingOptIn');
  const terms = watch('terms');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await api.auth.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        marketingOptIn: values.marketingOptIn,
      });
      // Auto sign-in for a smoother onboarding flow.
      const session = await api.auth.login({
        email: values.email,
        password: values.password,
      });
      setUser(session.user);
      toast.success('Welcome to TwinSpire — check your inbox to verify your email.');
      router.push('/account');
    } catch (err) {
      const message = (err as { message?: string }).message ?? 'Could not create your account';
      toast.error(message);
    }
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="register-first-name" label="First name" required error={errors.firstName?.message}>
          <Input autoComplete="given-name" {...register('firstName')} />
        </FormField>
        <FormField id="register-last-name" label="Last name" required error={errors.lastName?.message}>
          <Input autoComplete="family-name" {...register('lastName')} />
        </FormField>
      </div>
      <FormField id="register-email" label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
      </FormField>
      <FormField id="register-password" label="Password" required error={errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...register('password')} />
      </FormField>
      <PasswordStrengthMeter password={password ?? ''} />
      <FormField
        id="register-confirm"
        label="Confirm password"
        required
        error={errors.confirmPassword?.message}
      >
        <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      <Label className="flex cursor-pointer items-start gap-2 text-sm">
        <Checkbox
          className="mt-0.5"
          checked={marketingOptIn ?? false}
          onCheckedChange={(checked) => setValue('marketingOptIn', checked === true)}
        />
        <span className="font-normal text-muted-foreground">
          Send me product updates and special offers from TwinSpire.
        </span>
      </Label>
      <div>
        <Label className="flex cursor-pointer items-start gap-2 text-sm">
          <Checkbox
            className="mt-0.5"
            checked={Boolean(terms)}
            onCheckedChange={(checked) => setValue('terms', (checked === true) as true, { shouldValidate: true })}
          />
          <span className="font-normal text-muted-foreground">
            I agree to the {' '}
            <Link href="/legal/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and {' '}
            <Link href="/legal/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </Label>
        {errors.terms ? (
          <p className="mt-1 text-xs font-medium text-destructive">{errors.terms.message}</p>
        ) : null}
      </div>
      <Button type="submit" size="lg" loading={isSubmitting} fullWidth>
        Create account
      </Button>
    </form>
  );
}
