import { Schema, type Types } from 'mongoose';

import { SUPPORTED_CURRENCIES } from '@twinspire/utils';

/* =========================================================================
   Shared subschemas used across multiple top-level models.
   All are `_id: false` (embedded) and have no plugins attached.
   ========================================================================= */

export interface MoneySchemaShape {
  amount: number;
  currency: string;
}

export const moneySchema = new Schema<MoneySchemaShape>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, enum: SUPPORTED_CURRENCIES, uppercase: true },
  },
  { _id: false },
);

export interface ImageSchemaShape {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  position?: number;
}

export const imageSchema = new Schema<ImageSchemaShape>(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    alt: { type: String, required: true, trim: true, maxlength: 280, default: '' },
    width: { type: Number, min: 1, max: 16000 },
    height: { type: Number, min: 1, max: 16000 },
    blurDataUrl: { type: String, maxlength: 4096 },
    position: { type: Number, default: 0 },
  },
  { _id: false },
);

export interface VideoSchemaShape {
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  provider?: 'native' | 'youtube' | 'vimeo';
}

export const videoSchema = new Schema<VideoSchemaShape>(
  {
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    thumbnailUrl: { type: String, trim: true, maxlength: 2048 },
    duration: { type: Number, min: 0 },
    provider: { type: String, enum: ['native', 'youtube', 'vimeo'], default: 'native' },
  },
  { _id: false },
);

export interface SeoSchemaShape {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export const seoSchema = new Schema<SeoSchemaShape>(
  {
    title: { type: String, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 200 },
    keywords: { type: [String], default: undefined },
    canonicalUrl: { type: String, trim: true, maxlength: 2048 },
    ogImage: { type: String, trim: true, maxlength: 2048 },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false },
);

export interface WeightSchemaShape {
  value: number;
  unit: 'g' | 'kg' | 'lb' | 'oz';
}

export const weightSchema = new Schema<WeightSchemaShape>(
  {
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ['g', 'kg', 'lb', 'oz'], default: 'kg' },
  },
  { _id: false },
);

export interface DimensionsSchemaShape {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export const dimensionsSchema = new Schema<DimensionsSchemaShape>(
  {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ['cm', 'in'], default: 'cm' },
  },
  { _id: false },
);

export interface CoordinateSchemaShape {
  lat: number;
  lng: number;
}

export const coordinateSchema = new Schema<CoordinateSchemaShape>(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false },
);

/* GeoJSON point — for use with 2dsphere indexes. */
export interface GeoPointSchemaShape {
  type: 'Point';
  coordinates: [number, number];
}

export const geoPointSchema = new Schema<GeoPointSchemaShape>(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: 'coordinates must be [lng, lat]',
      },
    },
  },
  { _id: false },
);

/* Re-export a common ObjectId reference helper. */
export type ObjectIdRef = Types.ObjectId;
