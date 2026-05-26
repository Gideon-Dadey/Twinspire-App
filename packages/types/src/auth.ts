import type { ID } from './common';

export type UserRole = 'customer' | 'support' | 'staff' | 'manager' | 'admin' | 'superadmin';

export type Permission =
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'categories:write'
  | 'brands:write'
  | 'orders:read'
  | 'orders:write'
  | 'orders:refund'
  | 'inventory:write'
  | 'coupons:write'
  | 'reviews:moderate'
  | 'tickets:respond'
  | 'tickets:assign'
  | 'users:read'
  | 'users:write'
  | 'analytics:read'
  | 'settings:write'
  | 'audit:read';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface JwtAccessPayload {
  sub: ID;
  role: UserRole;
  sid: ID;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface JwtRefreshPayload {
  sub: ID;
  sid: ID;
  jti: ID;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  totpCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  marketingOptIn?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface SocialProvider {
  provider: 'google' | 'facebook' | 'apple';
}
