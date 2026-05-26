'use client';

import {
  Button,
  FormField,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@twinspire/ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useSession } from '@/lib/hooks/use-session';
import { useUpdatePreferences } from '@/lib/hooks/use-profile';

interface Values {
  locale: string;
  currency: string;
  marketingOptIn: boolean;
  newsletter: boolean;
}

const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'es-ES', label: 'Español' },
  { value: 'ja-JP', label: '日本語' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
];

export function PreferencesForm() {
  const { user } = useSession();
  const update = useUpdatePreferences();
  const {
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<Values>({
    defaultValues: {
      locale: 'en-US',
      currency: 'USD',
      marketingOptIn: false,
      newsletter: false,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        locale: user.preferences.locale,
        currency: user.preferences.currency,
        marketingOptIn: user.preferences.marketingOptIn,
        newsletter: user.preferences.newsletter,
      });
    }
  }, [user, reset]);

  const values = watch();

  const onSubmit = handleSubmit(async (input) => {
    await update.mutateAsync(input);
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="pref-locale" label="Language">
          <Select
            value={values.locale}
            onValueChange={(value) => setValue('locale', value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="pref-currency" label="Currency">
          <Select
            value={values.currency}
            onValueChange={(value) => setValue('currency', value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
          <div>
            <Label className="text-sm font-medium" htmlFor="pref-marketing">
              Marketing emails
            </Label>
            <p className="text-xs text-muted-foreground">
              New launches, sale events, and special offers.
            </p>
          </div>
          <Switch
            id="pref-marketing"
            checked={values.marketingOptIn}
            onCheckedChange={(checked) => setValue('marketingOptIn', checked, { shouldDirty: true })}
          />
        </div>
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
          <div>
            <Label className="text-sm font-medium" htmlFor="pref-newsletter">
              Newsletter
            </Label>
            <p className="text-xs text-muted-foreground">
              Monthly editorial highlights, buying guides, and product reviews.
            </p>
          </div>
          <Switch
            id="pref-newsletter"
            checked={values.newsletter}
            onCheckedChange={(checked) => setValue('newsletter', checked, { shouldDirty: true })}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          Save preferences
        </Button>
      </div>
    </form>
  );
}
