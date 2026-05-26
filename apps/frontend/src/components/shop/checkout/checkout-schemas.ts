import { z } from 'zod';

/**
 * Delivery details collected at checkout.
 *
 * TwinSpire is a Ghana-only storefront with phone-coordinated local delivery,
 * so this form intentionally omits any shipping rate/method picker — the
 * customer just gives us where to deliver and we call to confirm.
 *
 * The field is kept named `shippingSchema` (and the type `ShippingFormValues`)
 * for source-compatibility with the existing checkout flow plumbing; the user-
 * facing copy says "delivery" everywhere.
 */
export const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter your Ghana phone number so we can call to confirm'),
  line1: z.string().min(2, 'Street or landmark is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City or town is required'),
  // Ghana region: Greater Accra, Ashanti, Western, Eastern, …
  state: z.string().min(1, 'Region is required'),
  postalCode: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

/**
 * Payment selection. Three providers: `card` (Stripe) covers Visa/Mastercard,
 * `paypal` for international customers, `paystack` for Ghana mobile money
 * (MTN MoMo, Vodafone Cash, AirtelTigo Money) plus local card rails.
 */
export const paymentSchema = z.object({
  method: z.enum(['card', 'paypal', 'paystack']),
  /** Paystack channel — only meaningful when `method === 'paystack'`. */
  paystackChannel: z.enum(['momo', 'card', 'bank']).optional(),
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
