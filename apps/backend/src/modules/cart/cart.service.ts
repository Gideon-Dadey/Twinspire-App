import { Types } from 'mongoose';

import { env } from '../../config/env';
import { Cart, type CartDoc, type CartDocument } from '../../models/cart.model';
import { Product, type ProductDoc } from '../../models/product.model';
import { pricingService, type PricingCartItem } from '../../services/pricing';
import { HttpError } from '../../utils/http-error';

import type { Request, Response } from 'express';

const round2 = (n: number) => Math.round(n * 100) / 100;
const DEFAULT_CURRENCY = 'USD';

export interface CartIdentity {
  userId?: string;
  sessionId?: string;
}

export class CartService {
  /* ---------- Identity / cookie ---------- */

  resolveIdentity(req: Request, res: Response): CartIdentity {
    if (req.auth?.userId) return { userId: req.auth.userId };
    const cookieName = env.GUEST_CART_COOKIE;
    let sessionId = (req.signedCookies?.[cookieName] ?? req.cookies?.[cookieName]) as string | undefined;
    if (!sessionId) {
      sessionId = new Types.ObjectId().toHexString();
      res.cookie(cookieName, sessionId, {
        httpOnly: true,
        signed: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: env.ORDER_CART_TTL_DAYS * 24 * 60 * 60 * 1000,
      });
    }
    return { sessionId };
  }

  clearGuestCookie(res: Response): void {
    res.clearCookie(env.GUEST_CART_COOKIE, { httpOnly: true, signed: true, sameSite: 'lax' });
  }

  /* ---------- Read / mutate ---------- */

  async get(identity: CartIdentity): Promise<CartDocument> {
    const cart = await this.findOrCreate(identity);
    return this.recalculate(cart);
  }

  async addItem(
    identity: CartIdentity,
    input: { productId: string; variantId?: string; quantity: number },
  ): Promise<CartDocument> {
    const product = await Product.findById(input.productId).lean();
    if (product?.status !== 'published') throw HttpError.notFound('Product not found');

    let snapshot: ProductSnapshot;
    if (input.variantId) {
      const variant = product.variants?.find((v) => String(v._id) === input.variantId);
      if (!variant?.isActive) throw HttpError.notFound('Variant not found');
      snapshot = {
        sku: variant.sku,
        name: `${product.name} — ${variant.name}`,
        unitPriceAmount: variant.price.amount,
        currency: variant.price.currency,
        image: variant.images[0] ?? product.images[0],
      };
    } else {
      snapshot = {
        sku: product.sku,
        name: product.name,
        unitPriceAmount: product.price.amount,
        currency: product.price.currency,
        image: product.images[0],
      };
    }

    const cart = await this.findOrCreate(identity, snapshot.currency);
    const existingItem = cart.items.find(
      (i) =>
        String(i.productId) === input.productId &&
        (input.variantId ? String(i.variantId) === input.variantId : !i.variantId),
    );

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + input.quantity, 99);
      existingItem.lineTotal = {
        amount: round2(existingItem.unitPrice.amount * existingItem.quantity),
        currency: existingItem.unitPrice.currency,
      };
    } else {
      cart.items.push({
        _id: new Types.ObjectId(),
        productId: product._id,
        variantId: input.variantId ? new Types.ObjectId(input.variantId) : undefined,
        sku: snapshot.sku,
        name: snapshot.name,
        slug: product.slug,
        image: snapshot.image,
        unitPrice: { amount: snapshot.unitPriceAmount, currency: snapshot.currency },
        quantity: input.quantity,
        lineTotal: { amount: round2(snapshot.unitPriceAmount * input.quantity), currency: snapshot.currency },
        addedAt: new Date(),
      });
    }
    await cart.save();
    return this.recalculate(cart);
  }

  async updateItem(identity: CartIdentity, itemId: string, quantity: number): Promise<CartDocument> {
    const cart = await this.findOrCreate(identity);
    const item = cart.items.find((i) => String(i._id) === itemId);
    if (!item) throw HttpError.notFound('Cart item not found');
    if (quantity === 0) {
      cart.items = cart.items.filter((i) => String(i._id) !== itemId);
    } else {
      item.quantity = quantity;
      item.lineTotal = {
        amount: round2(item.unitPrice.amount * quantity),
        currency: item.unitPrice.currency,
      };
    }
    await cart.save();
    return this.recalculate(cart);
  }

  async removeItem(identity: CartIdentity, itemId: string): Promise<CartDocument> {
    return this.updateItem(identity, itemId, 0);
  }

  async clear(identity: CartIdentity): Promise<CartDocument> {
    const cart = await this.findOrCreate(identity);
    cart.items = [];
    cart.couponCodes = [];
    await cart.save();
    return this.recalculate(cart);
  }

  /* ---------- Coupons ---------- */

  async applyCoupon(identity: CartIdentity, code: string): Promise<CartDocument> {
    const cart = await this.findOrCreate(identity);
    const upper = code.trim().toUpperCase();
    if (cart.couponCodes.includes(upper)) {
      throw HttpError.conflict('Coupon already applied');
    }
    const recalced = await this.recalculate(cart, [...cart.couponCodes, upper]);
    if (recalced.couponCodes.includes(upper)) {
      // Coupon survived validation — persist.
      cart.couponCodes = recalced.couponCodes;
      await cart.save();
      return this.recalculate(cart);
    }
    throw HttpError.badRequest('Coupon is not valid for this cart', { code: 'INVALID_COUPON' });
  }

  async removeCoupon(identity: CartIdentity, code: string): Promise<CartDocument> {
    const cart = await this.findOrCreate(identity);
    cart.couponCodes = cart.couponCodes.filter((c) => c !== code.trim().toUpperCase());
    await cart.save();
    return this.recalculate(cart);
  }

  /* ---------- Merge guest cart on login ---------- */

  async mergeGuestIntoUser(sessionId: string, userId: string): Promise<CartDocument | null> {
    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) await guestCart.deleteOne();
      return null;
    }

    const userCart = await this.findOrCreate({ userId }, guestCart.currency);

    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) =>
          String(i.productId) === String(guestItem.productId) &&
          String(i.variantId ?? '') === String(guestItem.variantId ?? ''),
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + guestItem.quantity, 99);
        existing.lineTotal = {
          amount: round2(existing.unitPrice.amount * existing.quantity),
          currency: existing.unitPrice.currency,
        };
      } else {
        userCart.items.push({ ...guestItem, _id: new Types.ObjectId(), addedAt: new Date() });
      }
    }

    userCart.couponCodes = Array.from(new Set([...userCart.couponCodes, ...guestCart.couponCodes]));
    await userCart.save();
    await guestCart.deleteOne();

    return this.recalculate(userCart);
  }

  /* ---------- Internal ---------- */

  private async findOrCreate(identity: CartIdentity, currency = DEFAULT_CURRENCY): Promise<CartDocument> {
    if (!identity.userId && !identity.sessionId) {
      throw HttpError.badRequest('Missing cart identity');
    }
    const query = identity.userId ? { userId: identity.userId } : { sessionId: identity.sessionId };
    let cart = await Cart.findOne(query);
    if (cart) return cart;
    const zero = { amount: 0, currency };
    cart = await Cart.create({
      ...query,
      currency,
      items: [],
      couponCodes: [],
      totals: { subtotal: zero, discount: zero, shipping: zero, tax: zero, total: zero, itemCount: 0 },
      expiresAt: new Date(Date.now() + env.ORDER_CART_TTL_DAYS * 24 * 60 * 60 * 1000),
    });
    return cart;
  }

  private async recalculate(cart: CartDocument, overrideCouponCodes?: string[]): Promise<CartDocument> {
    const productIds = cart.items.map((i) => i.productId);
    const products = productIds.length
      ? await Product.find({ _id: { $in: productIds } }, { brandId: 1, categoryIds: 1 }).lean()
      : [];
    const productMap = new Map(products.map((p) => [String(p._id), p as ProductDoc]));

    const pricingItems: PricingCartItem[] = cart.items.map((item) => {
      const product = productMap.get(String(item.productId));
      return {
        productId: item.productId,
        variantId: item.variantId,
        unitPriceAmount: item.unitPrice.amount,
        quantity: item.quantity,
        categoryIds: product?.categoryIds ?? [],
        brandId: product?.brandId ?? new Types.ObjectId(),
      };
    });

    const codes = overrideCouponCodes ?? cart.couponCodes;
    const quote = await pricingService.quote({
      currency: cart.currency,
      items: pricingItems,
      couponCodes: codes,
      userId: cart.userId ? String(cart.userId) : undefined,
    });

    const currency = quote.currency;
    cart.totals = {
      subtotal: { amount: quote.subtotal, currency },
      discount: { amount: quote.discount, currency },
      shipping: { amount: quote.shipping, currency },
      tax: { amount: quote.tax, currency },
      total: { amount: quote.total, currency },
      itemCount: quote.itemCount,
    };
    cart.couponCodes = quote.appliedCoupons.map((c) => c.code);

    if (cart.isModified('items') || cart.isModified('couponCodes') || cart.isModified('totals')) {
      await cart.save();
    }
    return cart;
  }
}

interface ProductSnapshot {
  sku: string;
  name: string;
  unitPriceAmount: number;
  currency: string;
  image?: CartDoc['items'][number]['image'];
}

export const cartService = new CartService();
