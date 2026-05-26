import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import {
  geoPointSchema,
  imageSchema,
  type GeoPointSchemaShape,
  type ImageSchemaShape,
} from './common.schemas';

export interface StoreHoursShape {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  openTime?: string;
  closeTime?: string;
  closed: boolean;
}

const storeHoursSchema = new Schema<StoreHoursShape>(
  {
    day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
    openTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    closeTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

export interface StoreAttrs {
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  location: GeoPointSchemaShape;
  hours: StoreHoursShape[];
  images: ImageSchemaShape[];
  services: string[];
  isFlagship: boolean;
  isActive: boolean;
  timezone: string;
}

export interface StoreDoc extends StoreAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type StoreModelType = Model<StoreDoc> & PaginatedModel<StoreDoc>;

const storeSchema = new Schema<StoreDoc, StoreModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
      match: /^[a-z0-9-]+$/,
    },
    description: { type: String, trim: true, maxlength: 4000 },
    phone: { type: String, trim: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, maxlength: 240 },
    address: {
      line1: { type: String, required: true, trim: true, maxlength: 240 },
      line2: { type: String, trim: true, maxlength: 240 },
      city: { type: String, required: true, trim: true, maxlength: 120, index: true },
      state: { type: String, trim: true, maxlength: 120 },
      postalCode: { type: String, required: true, trim: true, maxlength: 32 },
      country: { type: String, required: true, trim: true, maxlength: 120 },
      countryCode: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 2,
        maxlength: 2,
        index: true,
      },
    },
    location: { type: geoPointSchema, required: true },
    hours: { type: [storeHoursSchema], default: [] },
    images: { type: [imageSchema], default: [] },
    services: { type: [{ type: String, trim: true, lowercase: true, maxlength: 64 }], default: [] },
    isFlagship: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    timezone: { type: String, default: 'UTC', maxlength: 64 },
  },
  { timestamps: true, collection: 'stores' },
);

applyBasePlugins(storeSchema);

storeSchema.index({ location: '2dsphere' });
storeSchema.index({ 'address.countryCode': 1, 'address.city': 1 });

export const Store = model<StoreDoc, StoreModelType>('Store', storeSchema);
export type StoreDocument = HydratedDocument<StoreDoc>;
