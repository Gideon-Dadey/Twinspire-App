import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface PermissionAttrs {
  key: string;
  resource: string;
  action: string;
  description?: string;
  isSystem?: boolean;
}

export interface PermissionDoc extends PermissionAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type PermissionModelType = Model<PermissionDoc> & PaginatedModel<PermissionDoc>;

const permissionSchema = new Schema<PermissionDoc, PermissionModelType>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 64,
      match: /^[a-z0-9_:.-]+$/,
    },
    resource: { type: String, required: true, trim: true, lowercase: true, index: true },
    action: { type: String, required: true, trim: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 240 },
    isSystem: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'permissions' },
);

applyBasePlugins(permissionSchema);

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission = model<PermissionDoc, PermissionModelType>('Permission', permissionSchema);
export type PermissionDocument = HydratedDocument<PermissionDoc>;
