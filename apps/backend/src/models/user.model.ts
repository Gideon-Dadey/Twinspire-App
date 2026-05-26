import bcrypt from 'bcryptjs';
import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import type { UserRole } from '@twinspire/types';
import { EMAIL_REGEX } from '@twinspire/utils';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  locale: string;
  currency: string;
  theme: ThemePreference;
  marketingOptIn: boolean;
  newsletter: boolean;
}

export interface UserAttrs {
  email: string;
  passwordHash?: string;
  emailVerifiedAt?: Date | null;
  phone?: string;
  phoneVerifiedAt?: Date | null;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes: string[];
  lastLoginAt?: Date | null;
  lastLoginIp?: string | null;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  preferences: UserPreferences;
  loyaltyPoints: number;
  externalIds: {
    google?: string;
    facebook?: string;
    apple?: string;
  };
}

export interface UserDoc extends UserAttrs {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserMethods {
  comparePassword(plain: string): Promise<boolean>;
  setPassword(plain: string): Promise<void>;
  isLocked(): boolean;
  recordSuccessfulLogin(ip?: string): Promise<void>;
  recordFailedLogin(): Promise<void>;
}

type UserModelType = Model<UserDoc, Record<string, never>, UserMethods> & PaginatedModel<UserDoc>;

const ROLES: UserRole[] = ['customer', 'support', 'staff', 'manager', 'admin', 'superadmin'];

const userSchema = new Schema<UserDoc, UserModelType, UserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 240,
      match: EMAIL_REGEX,
    },
    passwordHash: { type: String, select: false },
    emailVerifiedAt: { type: Date, default: null },
    phone: { type: String, trim: true, maxlength: 32 },
    phoneVerifiedAt: { type: Date, default: null },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    displayName: { type: String, trim: true, maxlength: 120 },
    avatarUrl: { type: String, trim: true, maxlength: 2048 },
    role: { type: String, enum: ROLES, default: 'customer', index: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'banned'],
      default: 'pending',
      index: true,
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorBackupCodes: { type: [String], default: [], select: false },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null, select: false },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date, default: null },
    preferences: {
      locale: { type: String, default: 'en-US' },
      currency: { type: String, default: 'USD', uppercase: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      marketingOptIn: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    externalIds: {
      google: { type: String, index: true, sparse: true },
      facebook: { type: String, index: true, sparse: true },
      apple: { type: String, index: true, sparse: true },
    },
  },
  { timestamps: true, collection: 'users' },
);

applyBasePlugins(userSchema);

const SENSITIVE_USER_FIELDS = [
  'passwordHash',
  'twoFactorSecret',
  'twoFactorBackupCodes',
  'failedLoginAttempts',
  'lockedUntil',
  'lastLoginIp',
] as const;

function scrubSensitiveUserFields(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
  for (const key of SENSITIVE_USER_FIELDS) delete ret[key];
  return ret;
}

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    const r = ret as unknown as Record<string, unknown>;
    if ('_id' in r && r._id != null) r.id = String(r._id);
    delete r._id;
    delete r.__v;
    return scrubSensitiveUserFields(doc, r);
  },
});

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    const r = ret as unknown as Record<string, unknown>;
    if ('_id' in r && r._id != null) r.id = String(r._id);
    delete r._id;
    delete r.__v;
    return scrubSensitiveUserFields(doc, r);
  },
});

userSchema.index({ status: 1, role: 1, createdAt: -1 });
userSchema.index({ emailVerifiedAt: 1 }, { sparse: true });

userSchema.virtual('fullName').get(function fullName(this: UserDoc) {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.virtual('addresses', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.methods.setPassword = async function setPassword(plain: string) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

userSchema.methods.comparePassword = async function comparePassword(plain: string) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.isLocked = function isLocked() {
  return Boolean(this.lockedUntil && this.lockedUntil.getTime() > Date.now());
};

userSchema.methods.recordSuccessfulLogin = async function recordSuccessfulLogin(ip?: string) {
  this.lastLoginAt = new Date();
  if (ip) this.lastLoginIp = ip;
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  await this.save();
};

userSchema.methods.recordFailedLogin = async function recordFailedLogin() {
  this.failedLoginAttempts = (this.failedLoginAttempts ?? 0) + 1;
  if (this.failedLoginAttempts >= 10) {
    this.lockedUntil = new Date(Date.now() + 15 * 60_000);
  }
  await this.save();
};

export const User = model<UserDoc, UserModelType>('User', userSchema);
export type UserDocument = HydratedDocument<UserDoc, UserMethods>;
