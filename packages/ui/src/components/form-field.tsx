import * as React from 'react';

import { cn } from '../lib/cn';

import { Label } from './label';

export interface FormFieldProps {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    invalid?: boolean;
  }>;
}

/**
 * Accessible form-field wrapper:
 *   <FormField id="email" label="Email" error={errors.email?.message}>
 *     <Input {...register('email')} />
 *   </FormField>
 */
export function FormField({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FormFieldProps): React.JSX.Element {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedByParts = [descriptionId, errorId].filter((part): part is string => Boolean(part));
  const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  const enhanced = React.cloneElement(children, {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    invalid: error ? true : undefined,
  });

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {enhanced}
      {description && !error && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
