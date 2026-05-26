import { Types } from 'mongoose';

import { User, type UserDoc, type UserDocument } from '../models/user.model';

import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<UserDoc> {
  constructor() {
    super(User);
  }

  /** Find by email, optionally including the password hash (for auth flows). */
  findByEmail(
    email: string,
    opts: { includePassword?: boolean; includeTotp?: boolean } = {},
  ): Promise<UserDocument | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (opts.includePassword) query.select('+passwordHash');
    if (opts.includeTotp) query.select('+twoFactorSecret');
    return query.exec();
  }

  findByExternal(
    provider: 'google' | 'facebook' | 'apple',
    externalId: string,
  ): Promise<UserDocument | null> {
    return User.findOne({ [`externalIds.${provider}`]: externalId }).exec();
  }

  countByRole(): Promise<{ role: string; count: number }[]> {
    return User.aggregate<{ role: string; count: number }>([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { _id: 0, role: '$_id', count: 1 } },
      { $sort: { role: 1 } },
    ]).exec();
  }

  async incrementLoyalty(userId: Types.ObjectId | string, delta: number): Promise<UserDoc | null> {
    return this.updateById(userId, { $inc: { loyaltyPoints: delta } });
  }
}

export const userRepository = new UserRepository();
