'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, AvatarFallback, AvatarImage, Button, FormField, Input } from '@twinspire/ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from '@/lib/hooks/use-session';
import { useUpdateProfile } from '@/lib/hooks/use-profile';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  displayName: z.string().max(120).optional().or(z.literal('')),
  phone: z
    .string()
    .max(32)
    .optional()
    .or(z.literal('')),
  avatarUrl: z
    .string()
    .url('Enter a valid URL')
    .max(2048)
    .optional()
    .or(z.literal('')),
});

type Values = z.infer<typeof schema>;

function initials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'TS'
  );
}

export function ProfileForm() {
  const { user } = useSession();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      phone: '',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName ?? '',
        phone: user.phone ?? '',
        avatarUrl: user.avatarUrl ?? '',
      });
    }
  }, [user, reset]);

  const watchedName = `${watch('firstName')} ${watch('lastName')}`.trim();
  const watchedAvatar = watch('avatarUrl');

  const onSubmit = handleSubmit(async (values) => {
    await updateProfile.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      avatarUrl: values.avatarUrl?.trim() || undefined,
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20">
          {watchedAvatar ? <AvatarImage src={watchedAvatar} alt={watchedName} /> : null}
          <AvatarFallback>{initials(watchedName || user?.email || 'TS')}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground">Profile photo</p>
          <p className="text-xs text-muted-foreground">
            Paste a URL to an avatar image. Uploads land in Phase 9 with S3 presigned URLs.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="profile-first-name" label="First name" required error={errors.firstName?.message}>
          <Input autoComplete="given-name" {...register('firstName')} />
        </FormField>
        <FormField id="profile-last-name" label="Last name" required error={errors.lastName?.message}>
          <Input autoComplete="family-name" {...register('lastName')} />
        </FormField>
      </div>
      <FormField
        id="profile-display-name"
        label="Display name"
        description="How others see your name on reviews and Q&A."
        error={errors.displayName?.message}
      >
        <Input {...register('displayName')} />
      </FormField>
      <FormField
        id="profile-phone"
        label="Phone"
        description="Used for shipping updates and order confirmations."
        error={errors.phone?.message}
      >
        <Input type="tel" autoComplete="tel" placeholder="+1 555 010 1234" {...register('phone')} />
      </FormField>
      <FormField
        id="profile-avatar-url"
        label="Avatar URL"
        description="Optional — leave blank to use your initials."
        error={errors.avatarUrl?.message}
      >
        <Input type="url" placeholder="https://…" {...register('avatarUrl')} />
      </FormField>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          disabled={!isDirty || isSubmitting}
          onClick={() => reset()}
        >
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
