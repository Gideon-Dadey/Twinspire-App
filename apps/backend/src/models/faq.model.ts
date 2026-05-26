import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import { applyBasePlugins, type PaginatedModel } from '../db/plugins';

export interface FaqAttrs {
  question: string;
  answer: string;
  categorySlug: string;
  position: number;
  helpfulCount: number;
  notHelpfulCount: number;
  isActive: boolean;
  tags: string[];
}

export interface FaqDoc extends FaqAttrs {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

type FaqModelType = Model<FaqDoc> & PaginatedModel<FaqDoc>;

const faqSchema = new Schema<FaqDoc, FaqModelType>(
  {
    question: { type: String, required: true, trim: true, maxlength: 480 },
    answer: { type: String, required: true, maxlength: 8000 },
    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    position: { type: Number, default: 0, index: true },
    helpfulCount: { type: Number, default: 0, min: 0 },
    notHelpfulCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    tags: { type: [{ type: String, trim: true, lowercase: true, maxlength: 32 }], default: [] },
  },
  { timestamps: true, collection: 'faqs' },
);

applyBasePlugins(faqSchema);

faqSchema.index({ categorySlug: 1, position: 1 });
faqSchema.index({ question: 'text', answer: 'text' }, { name: 'faq_text_index' });

export const Faq = model<FaqDoc, FaqModelType>('Faq', faqSchema);
export type FaqDocument = HydratedDocument<FaqDoc>;
