import { Address, type AddressDoc } from '../../models/address.model';
import { User, type UserDocument } from '../../models/user.model';
import { HttpError } from '../../utils/http-error';
import { sanitizeUser, type SanitizedUser } from '../auth/auth.service';

import type { AddressBody } from './users.schemas';
import type { SoftDeleteDocument } from '../../db/plugins';

export class UsersService {
  async getById(userId: string): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) throw HttpError.notFound('User not found');
    return user;
  }

  async getProfile(userId: string): Promise<SanitizedUser> {
    return sanitizeUser(await this.getById(userId));
  }

  async updateProfile(
    userId: string,
    patch: Partial<{
      firstName: string;
      lastName: string;
      displayName: string;
      phone: string;
      avatarUrl: string;
    }>,
  ): Promise<SanitizedUser> {
    const user = await this.getById(userId);
    if (patch.firstName !== undefined) user.firstName = patch.firstName;
    if (patch.lastName !== undefined) user.lastName = patch.lastName;
    if (patch.displayName !== undefined) user.displayName = patch.displayName;
    if (patch.phone !== undefined) user.phone = patch.phone;
    if (patch.avatarUrl !== undefined) user.avatarUrl = patch.avatarUrl;
    await user.save();
    return sanitizeUser(user);
  }

  async updatePreferences(
    userId: string,
    patch: Partial<UserDocument['preferences']>,
  ): Promise<UserDocument['preferences']> {
    const user = await this.getById(userId);
    user.preferences = { ...user.preferences, ...patch };
    await user.save();
    return user.preferences;
  }

  /* ---------- Addresses ---------- */

  listAddresses(userId: string): Promise<AddressDoc[]> {
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
  }

  async createAddress(userId: string, input: AddressBody): Promise<AddressDoc> {
    const doc = await Address.create({ ...input, userId });
    return doc.toObject();
  }

  async updateAddress(
    userId: string,
    addressId: string,
    patch: Partial<AddressBody>,
  ): Promise<AddressDoc> {
    const doc = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: patch },
      { new: true, runValidators: true },
    );
    if (!doc) throw HttpError.notFound('Address not found');
    return doc.toObject();
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const doc = await Address.findOne({ _id: addressId, userId });
    if (!doc) throw HttpError.notFound('Address not found');
    await (doc as unknown as SoftDeleteDocument).softDelete();
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<AddressDoc> {
    const doc = await Address.findOne({ _id: addressId, userId });
    if (!doc) throw HttpError.notFound('Address not found');
    doc.isDefault = true;
    await doc.save();
    return doc.toObject();
  }

  async softDeleteAccount(userId: string): Promise<void> {
    const user = await this.getById(userId);
    await (user as unknown as SoftDeleteDocument).softDelete();
  }
}

export const usersService = new UsersService();
