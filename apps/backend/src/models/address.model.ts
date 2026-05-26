import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

import { coordinateSchema, type CoordinateSchemaShape } from './common.schemas';

export type AddressKind = 'shipping' | 'billing' | 'both';

export interface AddressAttrs {
  userId: Types.ObjectId;
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
  isDefault?: boolean;
  coordinates?: CoordinateSchemaShape;
}

export interface AddressDoc extends AddressAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type AddressModelType = Model<AddressDoc> & PaginatedModel<AddressDoc>;

const addressSchema = new Schema<AddressDoc, AddressModelType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, trim: true, maxlength: 64 },
    kind: { type: String, enum: ['shipping', 'billing', 'both'], default: 'both', index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    email: { type: String, trim: true, lowercase: true, maxlength: 240 },
    company: { type: String, trim: true, maxlength: 120 },
    line1: { type: String, required: true, trim: true, maxlength: 240 },
    line2: { type: String, trim: true, maxlength: 240 },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    state: { type: String, trim: true, maxlength: 120 },
    postalCode: { type: String, required: true, trim: true, maxlength: 32 },
    country: { type: String, required: true, trim: true, maxlength: 120 },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      index: true,
    },
    isDefault: { type: Boolean, default: false, index: true },
    coordinates: { type: coordinateSchema, default: undefined },
  },
  { timestamps: true, collection: 'addresses' },
);

applyBasePlugins(addressSchema);

addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ userId: 1, kind: 1 });

addressSchema.pre('save', async function ensureSingleDefault(this: HydratedDocument<AddressDoc>) {
  if (!this.isDefault) return;
  await (this.constructor as AddressModelType).updateMany(
    { userId: this.userId, _id: { $ne: this._id }, isDefault: true },
    { $set: { isDefault: false } },
  );
});

export const Address = model<AddressDoc, AddressModelType>('Address', addressSchema);
export type AddressDocument = HydratedDocument<AddressDoc>;
