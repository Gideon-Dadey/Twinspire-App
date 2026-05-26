import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

/**
 * Generic key-value site settings. Use `category` to group settings
 * (e.g. `commerce`, `mail`, `feature_flags`).
 *
 * Strongly typed accessors live in the repository layer.
 */
export interface SettingAttrs {
  key: string;
  category: string;
  value: unknown;
  description?: string;
  isSecret: boolean;
  isPublic: boolean;
}

export interface SettingDoc extends SettingAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type SettingModelType = Model<SettingDoc> & PaginatedModel<SettingDoc>;

const settingSchema = new Schema<SettingDoc, SettingModelType>(
  {
    key: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, lowercase: true, trim: true, maxlength: 80, index: true },
    value: { type: Schema.Types.Mixed, default: null },
    description: { type: String, trim: true, maxlength: 600 },
    isSecret: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: 'settings' },
);

applyBasePlugins(settingSchema, { softDelete: false });

export const Setting = model<SettingDoc, SettingModelType>('Setting', settingSchema);
export type SettingDocument = HydratedDocument<SettingDoc>;
