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
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            {product.brandName}
          </p>
        )}
        <h1 className="type-page-heading mt-1">{product.name}</h1>
        {product.shortDescription && (
          <p className="text-muted-foreground mt-2">{product.shortDescription}</p>
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
          className="w-full sm:w-auto"
          leftIcon={<Heart aria-hidden />}
        >
          Save
        </Button>
      </div>

      <div className="border-border bg-muted/40 grid gap-3 rounded-lg border p-4 text-sm">
        <div className="flex items-start gap-3">
          <Truck className="text-primary mt-0.5 size-4" aria-hidden />
          <div>
            <p className="text-foreground font-medium">Free delivery in Ghana</p>
            <p className="text-muted-foreground text-xs">
              In stock at our Accra store. We&apos;ll call after payment to arrange same-day
              delivery in Greater Accra, 2–4 days nationwide.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-success mt-0.5 size-4" aria-hidden />
          <div>
            <p className="text-foreground font-medium">2-year TwinSpire warranty</p>
            <p className="text-muted-foreground text-xs">
              Includes accidental damage protection on every order, free of charge.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-xs font-medium transition-colors"
      >
        <Share2 className="size-3.5" aria-hidden />
        Share this product
      </button>
    </div>
  );
}
