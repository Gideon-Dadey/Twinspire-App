import { z } from 'zod';

export const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a phone number'),
  line1: z.string().min(2, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State or region is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

export const paymentSchema = z.object({
  method: z.enum(['card', 'paypal']),
  cardHolder: z.string().optional(),
  cardNumber: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9 ]{12,19}$/.test(value), 'Enter a 16-digit card number'),
  expMonth: z
    .string()
    .optional()
    .refine((value) => !value || /^(0[1-9]|1[0-2])$/.test(value), 'Use MM'),
  expYear: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{2}$/.test(value), 'Use YY'),
  cvv: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{3,4}$/.test(value), '3 or 4 digits'),
  savePaymentMethod: z.boolean().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
