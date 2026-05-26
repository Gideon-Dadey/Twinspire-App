import type { Types } from 'mongoose';

import { Order, type OrderDoc } from '../models/order.model';

import { BaseRepository } from './base.repository';

export class OrderRepository extends BaseRepository<OrderDoc> {
  constructor() {
    super(Order);
  }

  findByNumber(orderNumber: string): Promise<OrderDoc | null> {
    return this.findOne({ orderNumber: orderNumber.toUpperCase() });
  }

  findForUser(userId: Types.ObjectId | string, limit = 20): Promise<OrderDoc[]> {
    return this.find(
      { userId },
      { sort: { placedAt: -1 } as Record<string, 1 | -1> },
    ).then((rows) => rows.slice(0, limit));
  }

  async revenueBetween(start: Date, end: Date): Promise<{ orders: number; revenue: number }> {
    const [row] = await Order.aggregate<{ orders: number; revenue: number }>([
      { $match: { placedAt: { $gte: start, $lte: end }, paymentStatus: 'captured' } },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: '$totals.total.amount' },
        },
      },
      { $project: { _id: 0, orders: 1, revenue: 1 } },
    ]).exec();
    return row ?? { orders: 0, revenue: 0 };
  }
}

export const orderRepository = new OrderRepository();
