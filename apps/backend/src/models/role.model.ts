import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface RoleAttrs {
  name: string;
  slug: string;
  description?: string;
  permissionIds: Types.ObjectId[];
  isSystem?: boolean;
  rank?: number;
}

export interface RoleDoc extends RoleAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type RoleModelType = Model<RoleDoc> & PaginatedModel<RoleDoc>;

const roleSchema = new Schema<RoleDoc, RoleModelType>(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 64,
      match: /^[a-z0-9-]+$/,
    },
    description: { type: String, trim: true, maxlength: 240 },
    permissionIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Permission' }], default: [] },
    isSystem: { type: Boolean, default: false, index: true },
    rank: { type: Number, default: 0, index: true },
  },
  { timestamps: true, collection: 'roles' },
);

applyBasePlugins(roleSchema);

export const Role = model<RoleDoc, RoleModelType>('Role', roleSchema);
export type RoleDocument = HydratedDocument<RoleDoc>;
