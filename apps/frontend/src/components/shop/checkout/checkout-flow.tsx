'use client';

import { Button, EmptyState } from '@twinspire/ui';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { computeTotals } from '@/lib/helpers/cart-math';
import { useAddressesQuery } from '@/lib/hooks/use-addresses';
import { useSession } from '@/lib/hooks/use-session';
import { useCartStore } from '@/lib/stores/cart-store';

import { CartSummary } from '../cart/cart-summary';

import type { PaymentFormValues, ShippingFormValues } from './checkout-schemas';
import { CheckoutStepper, type CheckoutStep } from './checkout-stepper';
import { OrderReview } from './order-review';
import { PaymentForm } from './payment-form';
import { ShippingForm } from './shipping-form';

const SHIPPING_PRICE: Record<ShippingFormValues['shippingMethod'], number> = {
  standard: 0,
  express: 14.95,
  overnight: 24.95,
};

export function CheckoutFlow(): React.JSX.Element {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const clear = useCartStore((s) => s.clear);
  const close = useCartStore((s) => s.close);

  const { user, isAuthenticated } = useSession();
  const addresses = useAddressesQuery();
  const defaultAddress = addresses.data?.addresses.find((a) => a.isDefault) ?? addresses.data?.addresses[0];

  const sessionDefaults = React.useMemo<Partial<ShippingFormValues> | undefined>(() => {
    if (!user) return undefined;
    return {
      firstName: defaultAddress?.firstName ?? user.firstName,
      lastName: defaultAddress?.lastName ?? user.lastName,
      email: defaultAddress?.email ?? user.email,
      phone: defaultAddress?.phone ?? user.phone ?? '',
      line1: defaultAddress?.line1 ?? '',
      line2: defaultAddress?.line2 ?? '',
      city: defaultAddress?.city ?? '',
      state: defaultAddress?.state ?? '',
      postalCode: defaultAddress?.postalCode ?? '',
      country: defaultAddress?.country ?? 'United States',
    };
  }, [user, defaultAddress]);

  const [step, setStep] = React.useState<CheckoutStep>('shipping');
  const [completed, setCompleted] = React.useState<Set<CheckoutStep>>(new Set());
  const [shipping, setShipping] = React.useState<ShippingFormValues | undefined>();
  const [payment, setPayment] = React.useState<PaymentFormValues | undefined>();

  const shippingOverride =
    shipping && shipping.shippingMethod !== 'standard'
      ? SHIPPING_PRICE[shipping.shippingMethod]
      : undefined;

  const totals = React.useMemo(
    () => computeTotals(items, { couponCode, shippingOverride }),
    [items, couponCode, shippingOverride],
  );

  function markCompleted(target: CheckoutStep) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(target);
      return next;
    });
  }

  function handleShippingSubmit(values: ShippingFormValues) {
    setShipping(values);
    markCompleted('shipping');
    setStep('payment');
  }

  function handlePaymentSubmit(values: PaymentFormValues) {
    setPayment(values);
    markCompleted('payment');
    setStep('review');
  }

  async function handlePlaceOrder() {
    if (!shipping || !payment) return;
    await new Promise((resolve) => setTimeout(resolve, 900));
    const orderNumber = `TS-${Date.now().toString().slice(-8)}`;
    clear();
    close();
    toast.success(`Order ${orderNumber} placed`, {
      description: 'A confirmation email is on its way.',
    });
    router.push(`/checkout/success?order=${orderNumber}`);
  }

  if (items.length === 0 && step !== 'review') {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add a product before checking out."
        action={
          <Button asChild>
            <Link href="/deals">Shop deals</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
      <section className="space-y-8">
        <CheckoutStepper
          current={step}
          completed={completed}
          onStepClick={(target) => setStep(target)}
        />

        {step === 'shipping' && (
          <>
            {isAuthenticated && sessionDefaults?.line1 ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground">
                <p className="font-semibold">We&apos;ve filled in your saved details.</p>
                <p className="text-muted-foreground">
                  Edit anything below or pick a different address from{' '}
                  <Link href="/account/addresses" className="font-medium text-primary hover:underline">
                    your address book
                  </Link>
                  .
                </p>
              </div>
            ) : null}
            <ShippingForm
              defaultValues={shipping ?? sessionDefaults}
              onSubmit={handleShippingSubmit}
            />
          </>
        )}
        {step === 'payment' && (
          <PaymentForm
            defaultValues={payment}
            onSubmit={handlePaymentSubmit}
            onBack={() => setStep('shipping')}
          />
        )}
        {step === 'review' && shipping && payment && (
          <OrderReview
            items={items}
            shipping={shipping}
            payment={payment}
            onBack={() => setStep('payment')}
            onPlaceOrder={handlePlaceOrder}
          />
        )}
      </section>

      <CartSummary
        totals={totals}
        showCheckoutButton={false}
        className="h-fit lg:sticky lg:top-24"
      >
        <p className="text-xs text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} in this order
        </p>
      </CartSummary>
    </div>
  );
}
