import type {
  Address,
  AddressInput,
  Money,
  OrderStatus,
  Product,
  PublicUser,
  UserPreferences,
} from '@twinspire/types';

/** Shape returned by the real backend `POST /auth/login` / `/auth/refresh`. */
export interface AuthSessionResponse {
  accessToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  user: PublicUser;
}

export interface AuthRegisterResponse {
  user: PublicUser;
  message?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  totpCode?: string;
  backupCode?: string;
  deviceLabel?: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  marketingOptIn?: boolean;
  newsletter?: boolean;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface SocialLoginInput {
  provider: 'google' | 'facebook' | 'apple';
  idToken?: string;
  accessToken?: string;
}

/** A device/session row returned by `GET /auth/sessions`. */
export interface AuthSession {
  id: string;
  userId: string;
  deviceLabel?: string;
  ipAddress?: string;
  userAgent?: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface TwoFactorSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeSvg?: string;
  backupCodes: string[];
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
}

export type UpdatePreferencesInput = Partial<UserPreferences>;

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
}

export interface RecentlyViewedResponse {
  items: Array<{ productId: string; viewedAt: string; product: Product }>;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  total: Money;
  itemCount: number;
  previewImages: string[];
}

export interface OrderListResponse {
  items: OrderListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface AddressListResponse {
  addresses: Address[];
}

export type CreateAddressInput = AddressInput;
export type UpdateAddressInput = Partial<AddressInput>;

export interface MessageResponse {
  message: string;
}
