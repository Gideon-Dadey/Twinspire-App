'use client';

import type { Product } from '@twinspire/types';
import { Button, type ButtonProps } from '@twinspire/ui';
import { CartOutlineIcon } from '@/components/icons/cart-outline-icon';
import { toast } from 'sonner';
import * as React from 'react';

import { useCartStore } from '@/lib/stores/cart-store';

export interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: Product;
  quantity?: number;
  showIcon?: boolean;
}

export function AddToCartButton({
  product,
  quantity = 1,
  showIcon = true,
  size = 'sm',
  variant,
  className,
  children,
  ...rest
}: AddToCartButtonProps): React.JSX.Element {
  const addProduct = useCartStore((s) => s.addProduct);
  const outOfStock = product.stockStatus === 'out_of_stock';

  function handleClick() {
    addProduct(product, quantity);
    toast.success(`${product.name} added to cart`, {
      description: quantity > 1 ? `Quantity: ${quantity}` : undefined,
    });
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant ?? (outOfStock ? 'outline' : 'default')}
      disabled={outOfStock}
      leftIcon={showIcon ? <CartOutlineIcon className="size-4" /> : undefined}
      onClick={handleClick}
      className={className}
      {...rest}
    >
      {children ?? (outOfStock ? 'Notify me' : 'Add to cart')}
    </Button>
  );
}
