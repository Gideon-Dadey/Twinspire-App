import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { generateRandomToken } from '../../auth/crypto';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

import { getS3Client } from './s3';

const log = logger.child({ component: 'storage' });

export type UploadFolder = 'avatars' | 'product-images' | 'product-videos' | 'banners' | 'invoices' | 'misc';

export interface PresignUploadOptions {
  folder: UploadFolder;
  contentType: string;
  filename?: string;
  maxBytes?: number;
  ttlSeconds?: number;
  acl?: 'private' | 'public-read';
  metadata?: Record<string, string>;
}

export interface PresignedUpload {
  key: string;
  uploadUrl: string;
  publicUrl?: string;
  expiresIn: number;
  headers: Record<string, string>;
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

export class StorageService {
  get bucket(): string {
    if (!env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }
    return env.AWS_S3_BUCKET;
  }

  /** Build a public URL for a stored key (works for AWS, CloudFront, MinIO). */
  publicUrl(key: string): string {
    if (env.AWS_S3_PUBLIC_URL) {
      return `${env.AWS_S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    }
    if (env.AWS_S3_ENDPOINT) {
      const base = env.AWS_S3_ENDPOINT.replace(/\/$/, '');
      return env.AWS_S3_FORCE_PATH_STYLE
        ? `${base}/${this.bucket}/${key}`
        : `${base.replace('//', `//${this.bucket}.`)}/${key}`;
    }
    return `https://${this.bucket}.s3.${env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${key}`;
  }

  async createPresignedUpload(opts: PresignUploadOptions): Promise<PresignedUpload> {
    if (!ALLOWED_MIME.has(opts.contentType)) {
      throw new Error(`Unsupported mime type: ${opts.contentType}`);
    }
    const ext = sanitizeExtension(opts.filename) ?? mimeToExt(opts.contentType);
    const key = `${opts.folder}/${new Date().toISOString().slice(0, 10)}/${generateRandomToken(12)}${ext}`;

    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      ContentType: opts.contentType,
      ACL: opts.acl ?? 'private',
      Metadata: opts.metadata,
    };

    const command = new PutObjectCommand(input);
    const expiresIn = opts.ttlSeconds ?? 60;
    const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn });

    return {
      key,
      uploadUrl,
      publicUrl: opts.acl === 'public-read' ? this.publicUrl(key) : undefined,
      expiresIn,
      headers: {
        'Content-Type': opts.contentType,
      },
    };
  }

  async getDownloadUrl(key: string, ttlSeconds = 60): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(getS3Client(), command, { expiresIn: ttlSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await getS3Client().send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      log.warn({ err, key }, 'storage delete failed');
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await getS3Client().send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

function sanitizeExtension(filename?: string): string | null {
  if (!filename) return null;
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return null;
  const ext = filename.slice(dot).toLowerCase();
  return /^\.[a-z0-9]{1,8}$/.test(ext) ? ext : null;
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/avif':
      return '.avif';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    case 'video/mp4':
      return '.mp4';
    case 'video/webm':
      return '.webm';
    case 'application/pdf':
      return '.pdf';
    default:
      return '';
  }
}

export const storageService = new StorageService();
