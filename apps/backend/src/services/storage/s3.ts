import { S3Client } from '@aws-sdk/client-s3';

import { env } from '../../config/env';

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: env.AWS_REGION ?? 'us-east-1',
    endpoint: env.AWS_S3_ENDPOINT,
    forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
    credentials:
      env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  return client;
}

export function resetS3Client(): void {
  client = null;
}
