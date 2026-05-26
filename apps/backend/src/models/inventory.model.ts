import { Schema, Types, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export type InventoryMovementType =
  | 'purchase'
  | 'sale'
  | 'return'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'reservation'
  | 'release';

export interface InventoryMovementShape {
  _id: Types.ObjectId;
  type: InventoryMovementType;
  quantity: number;
  reason?: string;
  referenceType?: 'order' | 'return' | 'transfer' | 'manual';
  referenceId?: Types.ObjectId;
  performedByUserId?: Types.ObjectId;
  performedAt: Date;
}

const inventoryMovementSchema = new Schema<InventoryMovementShape>(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'purchase',
        'sale',
        'return',
        'transfer_in',
        'transfer_out',
        'adjustment',
        'reservation',
        'release',
      ],
    },
    quantity: { type: Number, required: true },
    reason: { type: String, maxlength: 240 },
    referenceType: { type: String, enum: ['order', 'return', 'transfer', 'manual'] },
    referenceId: { type: Schema.Types.ObjectId },
    performedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

export interface InventoryAttrs {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  sku: string;
  warehouseCode: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  reorderQuantity: number;
  movements: InventoryMovementShape[];
  lastRestockedAt?: Date | null;
}

export interface InventoryDoc extends InventoryAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type InventoryModelType = Model<InventoryDoc> & PaginatedModel<InventoryDoc>;

const inventorySchema = new Schema<InventoryDoc, InventoryModelType>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, index: true },
    sku: { type: String, required: true, trim: true, uppercase: true, index: true },
    warehouseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 32,
      default: 'MAIN',
    },
    onHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    reorderQuantity: { type: Number, default: 0, min: 0 },
    movements: { type: [inventoryMovementSchema], default: [] },
    lastRestockedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'inventory' },
);

applyBasePlugins(inventorySchema);

inventorySchema.index({ productId: 1, variantId: 1, warehouseCode: 1 }, { unique: true });
inventorySchema.index({ warehouseCode: 1, available: 1 });
inventorySchema.index({ available: 1, reorderLevel: 1 });

inventorySchema.pre('save', function syncAvailable(this: HydratedDocument<InventoryDoc>) {
  this.available = Math.max(0, this.onHand - this.reserved);
});

export const Inventory = model<InventoryDoc, InventoryModelType>('Inventory', inventorySchema);
export type InventoryDocument = HydratedDocument<InventoryDoc>;
