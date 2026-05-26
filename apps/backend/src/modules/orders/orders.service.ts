import { Types } from 'mongoose';

import { Cart, type CartDoc, type CartDocument } from '../../models/cart.model';
import { Coupon } from '../../models/coupon.model';
import { Order, type OrderAddressShape, type OrderDoc, type OrderDocument, type OrderStatus } from '../../models/order.model';
import { Product, type ProductDoc } from '../../models/product.model';
import { cacheService } from '../../services/cache';
import { pricingService, type PricingCartItem } from '../../services/pricing';
import { HttpError } from '../../utils/http-error';

import type { OrderListQuery } from './orders.schemas';
import type { FilterQuery } from 'mongoose';

interface CartIdentity {
  userId?: string;
  sessionId?: string;
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['awaiting_payment', 'cancelled', 'failed'],
  awaiting_payment: ['paid', 'cancelled', 'failed'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'on_hold', 'cancelled'],
  shipped: ['delivered', 'on_hold'],
  delivered: ['completed', 'refunded'],
  completed: ['refunded'],
  on_hold: ['processing', 'cancelled'],
  cancelled: [],
  refunded: [],
  failed: ['pending'],
};

export class OrdersService {
  /* ---------- Quote ---------- */

  async quote(identity: CartIdentity, opts: { couponCodes?: string[]; country?: string } = {}): Promise<unknown> {
    const cart = await this.loadCart(identity);
    if (!cart || cart.items.length === 0) throw HttpError.badRequest('Cart is empty');
    const pricingItems = await this.buildPricingItems(cart);
    const codes = opts.couponCodes ?? cart.couponCodes;
    return pricingService.quote({
      currency: cart.currency,
      items: pricingItems,
      couponCodes: codes,
      userId: identity.userId,
      shippingAddressCountry: opts.country,
    });
  }

  /* ---------- Place order (idempotent) ---------- */

  async placeOrder(
    identity: CartIdentity,
    input: {
      shippingAddress: OrderAddressShape;
      billingAddress?: OrderAddressShape;
      shippingMethodId?: string;
      paymentProvider: 'stripe' | 'paypal';
      guestEmail?: string;
      notes?: string;
      idempotencyKey?: string;
    },
  ): Promise<OrderDocument> {
    const cart = await this.loadCart(identity);
    if (!cart || cart.items.length === 0) throw HttpError.badRequest('Cart is empty');

    if (!identity.userId && !input.guestEmail) {
      throw HttpError.badRequest('Guest email is required for guest orders', { code: 'GUEST_EMAIL_REQUIRED' });
    }

    /* Idempotency: cache previous result for a short window */
    const idemKey = input.idempotencyKey
      ? `order:idem:${identity.userId ?? identity.sessionId ?? 'anon'}:${input.idempotencyKey}`
      : null;
    if (idemKey) {
      const prior = await cacheService.get<{ orderId: string }>(idemKey);
      if (prior) {
        const existing = await Order.findById(prior.orderId);
        if (existing) return existing;
      }
    }

    /* Distributed lock so two concurrent submits don't both create orders */
    const lockKey = `order:lock:${cart._id}`;
    const lockToken = await cacheService.acquireLock(lockKey, 30);
    if (!lockToken) throw HttpError.conflict('Order is already being processed');

    try {
      const pricingItems = await this.buildPricingItems(cart);
      const quote = await pricingService.quote({
        currency: cart.currency,
        items: pricingItems,
        couponCodes: cart.couponCodes,
        userId: identity.userId,
        shippingAddressCountry: input.shippingAddress.countryCode,
      });

      const productIds = cart.items.map((i) => i.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map((p) => [String(p._id), p]));
      const orderItems = cart.items.map((item) => {
        const product = productMap.get(String(item.productId));
        const inStock = this.checkInStock(product, item.variantId, item.quantity);
        if (!inStock) {
          throw HttpError.conflict(`Insufficient stock for ${item.name}`, {
            code: 'INSUFFICIENT_STOCK',
            details: { productId: item.productId },
          });
        }
        return {
          _id: new Types.ObjectId(),
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          attributes: item.attributes,
        };
      });

      const currency = cart.currency;
      const zero = { amount: 0, currency };
      const totals = {
        subtotal: { amount: quote.subtotal, currency },
        discount: { amount: quote.discount, currency },
        shipping: { amount: quote.shipping, currency },
        tax: { amount: quote.tax, currency },
        total: { amount: quote.total, currency },
      };

      const order = await Order.create({
        userId: identity.userId,
        guestEmail: input.guestEmail,
        items: orderItems,
        totals,
        currency,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress ?? input.shippingAddress,
        couponCodes: quote.appliedCoupons.map((c) => c.code),
        notes: input.notes,
        paymentMethod: { provider: input.paymentProvider },
        status: 'pending',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        timeline: [{ status: 'pending', occurredAt: new Date(), note: 'Order created' }],
        placedAt: new Date(),
      });

      // Reserve inventory and increment coupon usage
      await Promise.all([
        this.reserveStockForOrder(orderItems),
        this.incrementCouponUsage(quote.appliedCoupons.map((c) => c.code)),
      ]);

      // Clear the cart
      cart.items = [];
      cart.couponCodes = [];
      cart.totals = {
        subtotal: zero,
        discount: zero,
        shipping: zero,
        tax: zero,
        total: zero,
        itemCount: 0,
      };
      await cart.save();

      if (idemKey) await cacheService.set(idemKey, { orderId: String(order._id) }, { ttlSeconds: 60 * 60 });

      return order;
    } finally {
      await cacheService.releaseLock(lockKey, lockToken);
    }
  }

  /* ---------- User-facing ---------- */

  async listForUser(userId: string, query: OrderListQuery): Promise<{ items: OrderDoc[]; meta: unknown }> {
    const filter: FilterQuery<OrderDoc> = { userId };
    if (query.status) filter.status = query.status;
    const paged = await Order.paginate(filter, {
      page: query.page,
      limit: query.limit,
      sort: { placedAt: -1 },
    });
    return { items: paged.items, meta: paged.meta };
  }

  async getForUser(userId: string, orderId: string): Promise<OrderDoc> {
    const order = await Order.findOne({ _id: orderId, userId }).lean();
    if (!order) throw HttpError.notFound('Order not found');
    return order;
  }

  async cancelByUser(userId: string, orderId: string): Promise<OrderDoc> {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw HttpError.notFound('Order not found');
    if (!['pending', 'awaiting_payment'].includes(order.status)) {
      throw HttpError.conflict('Order can no longer be cancelled', { code: 'CANCEL_NOT_ALLOWED' });
    }
    await this.transitionStatus(order, 'cancelled', userId, 'Cancelled by customer');
    return order.toObject();
  }

  /* ---------- Admin ---------- */

  async adminList(query: OrderListQuery): Promise<{ items: OrderDoc[]; meta: unknown }> {
    const filter: FilterQuery<OrderDoc> = {};
    if (query.status) filter.status = query.status;
    const paged = await Order.paginate(filter, {
      page: query.page,
      limit: query.limit,
      sort: { placedAt: -1 },
    });
    return { items: paged.items, meta: paged.meta };
  }

  async adminGet(orderId: string): Promise<OrderDoc> {
    const order = await Order.findById(orderId).lean();
    if (!order) throw HttpError.notFound('Order not found');
    return order;
  }

  async adminUpdate(
    orderId: string,
    actorId: string,
    patch: {
      status?: OrderStatus;
      fulfillmentStatus?: OrderDoc['fulfillmentStatus'];
      note?: string;
      trackingNumber?: string;
      carrier?: string;
    },
  ): Promise<OrderDoc> {
    const order = await Order.findById(orderId);
    if (!order) throw HttpError.notFound('Order not found');

    if (patch.status && patch.status !== order.status) {
      await this.transitionStatus(order, patch.status, actorId, patch.note);
    }
    if (patch.fulfillmentStatus) order.fulfillmentStatus = patch.fulfillmentStatus;
    if (patch.trackingNumber || patch.carrier) {
      order.shippingMethod = {
        ...(order.shippingMethod ?? {}),
        name: order.shippingMethod?.name ?? 'Standard',
        trackingNumber: patch.trackingNumber ?? order.shippingMethod?.trackingNumber,
        carrier: patch.carrier ?? order.shippingMethod?.carrier,
      };
    }
    await order.save();
    return order.toObject();
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDoc | null> {
    return Order.findOne({ orderNumber: orderNumber.toUpperCase() }).lean();
  }

  /* ---------- Status transitions ---------- */

  async transitionStatus(
    order: OrderDocument,
    next: OrderStatus,
    byUserId?: string,
    note?: string,
  ): Promise<void> {
    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(next)) {
      throw HttpError.badRequest(`Cannot transition order from ${order.status} to ${next}`, {
        code: 'INVALID_TRANSITION',
      });
    }
    order.status = next;
    order.timeline.push({
      status: next,
      occurredAt: new Date(),
      note,
      byUserId: byUserId ? new Types.ObjectId(byUserId) : undefined,
    });
    if (next === 'paid') order.paidAt = new Date();
    if (next === 'shipped') order.shippedAt = new Date();
    if (next === 'delivered') order.deliveredAt = new Date();
    if (next === 'cancelled') order.cancelledAt = new Date();
    await order.save();
  }

  async markPaid(orderId: string, providerPaymentId: string, last4?: string): Promise<OrderDoc> {
    const order = await Order.findById(orderId);
    if (!order) throw HttpError.notFound('Order not found');
    if (order.paymentStatus === 'captured') return order.toObject();
    order.paymentStatus = 'captured';
    order.paymentMethod = {
      ...(order.paymentMethod ?? { provider: 'stripe' }),
      last4,
    };
    if (order.status === 'pending' || order.status === 'awaiting_payment') {
      await this.transitionStatus(order, 'paid', undefined, `Payment ${providerPaymentId} captured`);
    } else {
      await order.save();
    }
    return order.toObject();
  }

  async markFailed(orderId: string, reason: string): Promise<void> {
    const order = await Order.findById(orderId);
    if (!order) return;
    order.paymentStatus = 'failed';
    if (order.status === 'pending' || order.status === 'awaiting_payment') {
      await this.transitionStatus(order, 'failed', undefined, reason);
    } else {
      await order.save();
    }
  }

  async markRefunded(orderId: string, refundedAmount: number, reason?: string): Promise<void> {
    const order = await Order.findById(orderId);
    if (!order) return;
    order.paymentStatus = refundedAmount >= order.totals.total.amount ? 'refunded' : 'partially_refunded';
    if (order.paymentStatus === 'refunded' && order.status !== 'refunded') {
      await this.transitionStatus(order, 'refunded', undefined, reason ?? 'Refunded');
    } else {
      await order.save();
    }
  }

  /* ---------- Internals ---------- */

  private async loadCart(identity: CartIdentity): Promise<CartDocument | null> {
    if (identity.userId) return Cart.findOne({ userId: identity.userId });
    if (identity.sessionId) return Cart.findOne({ sessionId: identity.sessionId });
    return null;
  }

  private async buildPricingItems(cart: CartDoc): Promise<PricingCartItem[]> {
    const productIds = cart.items.map((i) => i.productId);
    const products = await Product.find(
      { _id: { $in: productIds } },
      { brandId: 1, categoryIds: 1 },
    ).lean();
    const map = new Map(products.map((p) => [String(p._id), p as ProductDoc]));
    return cart.items.map((item) => {
      const p = map.get(String(item.productId));
      return {
        productId: item.productId,
        variantId: item.variantId,
        unitPriceAmount: item.unitPrice.amount,
        quantity: item.quantity,
        categoryIds: p?.categoryIds ?? [],
        brandId: p?.brandId ?? new Types.ObjectId(),
      };
    });
  }

  private checkInStock(
    product: ProductDoc | undefined,
    variantId: Types.ObjectId | undefined,
    quantity: number,
  ): boolean {
    if (!product) return false;
    if (variantId) {
      const variant = product.variants.find((v) => String(v._id) === String(variantId));
      if (!variant) return false;
      return variant.stock - variant.reservedStock >= quantity;
    }
    return product.stockStatus !== 'out_of_stock';
  }

  private async reserveStockForOrder(items: { productId: Types.ObjectId; variantId?: Types.ObjectId; quantity: number }[]): Promise<void> {
    await Promise.all(
      items.map((item) => {
        if (item.variantId) {
          return Product.updateOne(
            { _id: item.productId, 'variants._id': item.variantId },
            { $inc: { 'variants.$.reservedStock': item.quantity, salesCount: item.quantity } },
          ).exec();
        }
        return Product.updateOne(
          { _id: item.productId },
          { $inc: { salesCount: item.quantity } },
        ).exec();
      }),
    );
  }

  private async incrementCouponUsage(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    await Coupon.updateMany({ code: { $in: codes } }, { $inc: { usedCount: 1 } });
  }
}

export const ordersService = new OrdersService();
