import type { BaseEntity, ID } from './common';

export type AddressKind = 'shipping' | 'billing' | 'both';

export interface Address extends BaseEntity {
  userId: ID;
  label?: string;
  kind: AddressKind;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  countryCode: string;
  isDefault: boolean;
  coordinates?: { lat: number; lng: number };
}

export type AddressInput = Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>;
