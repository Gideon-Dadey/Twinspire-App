import type { Types } from 'mongoose';

import { Cart, type CartDoc } from '../models/cart.model';

import { BaseRepository } from './base.repository';

export class CartRepository extends BaseRepository<CartDoc> {
  constructor() {
    super(Cart);
  }

  findActiveByUser(userId: Types.ObjectId | string): Promise<CartDoc | null> {
    return this.findOne(
      { userId },
      { sort: { updatedAt: -1 } as Record<string, 1 | -1> },
    );
  }

  findActiveBySession(sessionId: string): Promise<CartDoc | null> {
    return this.findOne(
      { sessionId },
      { sort: { updatedAt: -1 } as Record<string, 1 | -1> },
    );
  }
}

export const cartRepository = new CartRepository();
