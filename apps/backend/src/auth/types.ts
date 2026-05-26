import type { UserRole } from '@twinspire/types';

export interface AccessTokenClaims {
  /** Subject — user id. */
  sub: string;
  email: string;
  role: UserRole;
  /** Refresh-session id (so access tokens can be revoked with a session). */
  sid: string;
  /** Token type discriminator. */
  type: 'access';
}

export interface RefreshTokenClaims {
  sub: string;
  /** Session id (Mongo _id of the Session row). */
  sid: string;
  /** Random JTI used as the hashed identifier in the DB. */
  jti: string;
  type: 'refresh';
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
  sessionId: string;
}

export interface AuthenticatedRequest {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware when a valid access token is present. */
      auth?: AuthenticatedRequest;
    }
  }
}

export {};
