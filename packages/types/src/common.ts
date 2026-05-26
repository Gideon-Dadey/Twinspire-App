/** Universal ID type — Mongo ObjectId as string on the wire. */
export type ID = string;

/** ISO 8601 date string. */
export type ISODateString = string;

export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SoftDeletable {
  deletedAt?: ISODateString | null;
}

export interface BaseEntity extends Timestamps, SoftDeletable {
  id: ID;
}

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'GHS'
  | 'NGN'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'INR'
  | 'CNY';

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface Weight {
  value: number;
  unit: 'g' | 'kg' | 'lb' | 'oz';
}

export interface Image {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  position?: number;
}

export interface VideoAsset {
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  provider?: 'native' | 'youtube' | 'vimeo';
}

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}
