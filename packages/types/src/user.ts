import type { Address } from './address';
import type { UserRole } from './auth';
import type { BaseEntity } from './common';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

export interface UserPreferences {
  locale: string;
  currency: string;
  theme?: 'light' | 'dark' | 'system';
  marketingOptIn: boolean;
  newsletter: boolean;
}

export interface User extends BaseEntity {
  email: string;
  emailVerifiedAt?: string | null;
  phone?: string;
  phoneVerifiedAt?: string | null;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  preferences: UserPreferences;
  addresses?: Address[];
  loyaltyPoints?: number;
}

/** Safe-to-send-to-client subset of a User. */
export type PublicUser = Omit<User, 'lastLoginIp'>;
