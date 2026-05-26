'use client';

import type { Product } from '@twinspire/types';
import {
  Badge,
  Button,
  PriceTag,
  QuantityStepper,
  RatingStars,
  Separator,
  StockBadge,
} from '@twinspire/ui';
import { Heart, ShieldCheck, Share2, Truck } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { useCartStore } from '@/lib/stores/cart-store';

export interface ProductBuyBoxProps {
  product: Product;
}

export function ProductBuyBox({ product }: ProductBuyBoxProps): React.JSX.Element {
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);
  const addProduct = useCartStore((s) => s.addProduct);

  const outOfStock = product.stockStatus === 'out_of_stock';
  const rating = product.rating;

  async function handleAddToCart() {
    setAdding(true);
    addProduct(product, quantity);
    await new Promise((r) => setTimeout(r, 250));
    toast.success(`${product.name} added to cart`, {
      description: quantity > 1 ? `Quantity: ${quantity}` : undefined,
    });
    setAdding(false);
  }

  async function handleShare() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: product.name,
          url: typeof window !== 'undefined' ? window.location.href : '/',
        });
        return;
      } catch {
        // user dismissed — fall through to copy
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        {product.brandName && (
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brandName}
          </p>
        )}
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
          {product.name}
        </h1>
        {product.shortDescription && (
          <p className="mt-2 text-muted-foreground">{product.shortDescription}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {rating && rating.count > 0 && (
          <RatingStars value={rating.average} count={rating.count} size="sm" />
        )}
        <StockBadge status={product.stockStatus} />
        {product.isNewArrival && <Badge variant="info">New</Badge>}
        {product.isBestSeller && <Badge variant="accent">Best seller</Badge>}
      </div>

      <div className="flex items-end gap-3">
        <PriceTag price={product.price} size="xl" />
      </div>

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <QuantityStepper
          value={quantity}
          onValueChange={setQuantity}
          min={1}
          max={10}
          aria-label="Quantity"
        />
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          loading={adding}
          disabled={outOfStock}
        >
          {outOfStock ? 'Notify me when back' : `Add ${quantity > 1 ? `${quantity} ` : ''}to cart`}
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label="Add to wishlist"
          onClick={() => toast.success('Saved to wishlist')}
          className="sm:w-auto"
          leftIcon={<Heart aria-hidden />}
        >
          Save
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 size-4 text-primary" aria-hidden />
          <div>
            <p className="font-medium text-foreground">Free 2-day delivery</p>
            <p className="text-xs text-muted-foreground">
              Order in the next 4 hours for next-day delivery to most US zip codes.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 text-success" aria-hidden />
          <div>
            <p className="font-medium text-foreground">2-year TwinSpire warranty</p>
            <p className="text-xs text-muted-foreground">
              Includes accidental damage protection on every order, free of charge.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="inline-flex w-fit items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Share2 className="size-3.5" aria-hidden />
        Share this product
      </button>
    </div>
  );
}
