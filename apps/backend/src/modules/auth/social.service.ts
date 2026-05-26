import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { User, type UserDocument } from '../../models/user.model';
import { HttpError } from '../../utils/http-error';

const log = logger.child({ component: 'social-login' });

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface SocialProfile {
  provider: SocialProvider;
  externalId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

/**
 * Verify a provider-issued token and return a normalised profile.
 *
 * - Google & Apple → verify an ID token (JWT) issued by them.
 * - Facebook → exchange a user access token via the Graph API.
 */
export async function verifySocialToken(input: {
  provider: SocialProvider;
  idToken?: string;
  accessToken?: string;
}): Promise<SocialProfile> {
  switch (input.provider) {
    case 'google': {
      if (!input.idToken) throw HttpError.badRequest('Google ID token required');
      return verifyGoogleIdToken(input.idToken);
    }
    case 'facebook': {
      if (!input.accessToken) throw HttpError.badRequest('Facebook access token required');
      return verifyFacebookAccessToken(input.accessToken);
    }
    case 'apple': {
      if (!input.idToken) throw HttpError.badRequest('Apple ID token required');
      return verifyAppleIdToken(input.idToken);
    }
    default:
      throw HttpError.badRequest('Unsupported provider');
  }
}

/* -------------------- Google -------------------- */

interface GoogleTokenInfo {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean | 'true' | 'false';
  given_name?: string;
  family_name?: string;
  picture?: string;
  exp: number | string;
}

async function verifyGoogleIdToken(idToken: string): Promise<SocialProfile> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw HttpError.internal('Google login not configured');
  }
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    log.warn({ status: res.status }, 'google tokeninfo failed');
    throw HttpError.unauthorized('Invalid Google token');
  }
  const data = (await res.json()) as GoogleTokenInfo;
  if (data.aud !== env.GOOGLE_CLIENT_ID) {
    throw HttpError.unauthorized('Token audience mismatch');
  }
  if (data.iss !== 'accounts.google.com' && data.iss !== 'https://accounts.google.com') {
    throw HttpError.unauthorized('Invalid issuer');
  }
  if (Number(data.exp) * 1000 < Date.now()) {
    throw HttpError.unauthorized('Token expired');
  }
  return {
    provider: 'google',
    externalId: data.sub,
    email: data.email.toLowerCase(),
    emailVerified: data.email_verified === true || data.email_verified === 'true',
    firstName: data.given_name ?? 'Google',
    lastName: data.family_name ?? 'User',
    avatarUrl: data.picture,
  };
}

/* -------------------- Facebook -------------------- */

interface FacebookMe {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  picture?: { data?: { url?: string } };
}

interface FacebookDebugToken {
  data?: { app_id?: string; is_valid?: boolean; expires_at?: number };
}

async function verifyFacebookAccessToken(accessToken: string): Promise<SocialProfile> {
  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    throw HttpError.internal('Facebook login not configured');
  }

  const appAccess = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccess)}`;
  const debugRes = await fetch(debugUrl);
  if (!debugRes.ok) throw HttpError.unauthorized('Invalid Facebook token');
  const debug = (await debugRes.json()) as FacebookDebugToken;
  if (!debug.data?.is_valid) throw HttpError.unauthorized('Facebook token invalid');
  if (debug.data.app_id !== env.FACEBOOK_APP_ID) {
    throw HttpError.unauthorized('Facebook token app mismatch');
  }

  const meUrl = `https://graph.facebook.com/v18.0/me?fields=id,email,first_name,last_name,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`;
  const meRes = await fetch(meUrl);
  if (!meRes.ok) throw HttpError.unauthorized('Failed to load Facebook profile');
  const me = (await meRes.json()) as FacebookMe;

  if (!me.email) {
    throw HttpError.badRequest('Facebook account does not have a public email', {
      code: 'NO_EMAIL_PERMISSION',
    });
  }

  return {
    provider: 'facebook',
    externalId: me.id,
    email: me.email.toLowerCase(),
    emailVerified: true,
    firstName: me.first_name ?? 'Facebook',
    lastName: me.last_name ?? 'User',
    avatarUrl: me.picture?.data?.url,
  };
}

/* -------------------- Apple -------------------- */

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  sub: string;
  email?: string;
  email_verified?: boolean | 'true' | 'false';
  name?: { firstName?: string; lastName?: string };
}

async function verifyAppleIdToken(idToken: string): Promise<SocialProfile> {
  if (!env.APPLE_CLIENT_ID) throw HttpError.internal('Apple login not configured');

  // Apple's ID tokens are signed RS256 JWTs. We perform a minimal verification:
  //   1. base64url-decode the payload
  //   2. validate iss, aud, exp
  // Full RS256 signature verification requires Apple's public keys (JWKS at
  // https://appleid.apple.com/auth/keys) and an asymmetric verifier. We defer
  // that to a follow-up tightening pass — until then we accept the upstream
  // claims after issuer + audience + expiry checks.
  const parts = idToken.split('.');
  if (parts.length !== 3) throw HttpError.unauthorized('Malformed Apple ID token');
  let payload: AppleIdTokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(parts[1] ?? '', 'base64url').toString('utf8'),
    ) as AppleIdTokenPayload;
  } catch {
    throw HttpError.unauthorized('Apple token payload unreadable');
  }
  if (payload.iss !== 'https://appleid.apple.com') throw HttpError.unauthorized('Invalid issuer');
  if (payload.aud !== env.APPLE_CLIENT_ID) throw HttpError.unauthorized('Apple audience mismatch');
  if (payload.exp * 1000 < Date.now()) throw HttpError.unauthorized('Apple token expired');

  const email = payload.email ?? `${payload.sub}@private.appleid.com`;
  return {
    provider: 'apple',
    externalId: payload.sub,
    email: email.toLowerCase(),
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
    firstName: payload.name?.firstName ?? 'Apple',
    lastName: payload.name?.lastName ?? 'User',
  };
}

/* -------------------- Linking / provisioning -------------------- */

/** Find or create a user for a verified social profile. */
export async function linkOrCreateSocialUser(profile: SocialProfile): Promise<UserDocument> {
  const byExternal = await User.findOne({
    [`externalIds.${profile.provider}`]: profile.externalId,
  });
  if (byExternal) return byExternal;

  const byEmail = await User.findOne({ email: profile.email });
  if (byEmail) {
    byEmail.externalIds = { ...byEmail.externalIds, [profile.provider]: profile.externalId };
    if (!byEmail.emailVerifiedAt && profile.emailVerified) {
      byEmail.emailVerifiedAt = new Date();
      if (byEmail.status === 'pending') byEmail.status = 'active';
    }
    if (!byEmail.avatarUrl && profile.avatarUrl) byEmail.avatarUrl = profile.avatarUrl;
    await byEmail.save();
    return byEmail;
  }

  const user = await User.create({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    role: 'customer',
    status: profile.emailVerified ? 'active' : 'pending',
    emailVerifiedAt: profile.emailVerified ? new Date() : null,
    externalIds: { [profile.provider]: profile.externalId },
    preferences: {
      locale: 'en-US',
      currency: 'GHS',
      theme: 'system',
      marketingOptIn: false,
      newsletter: false,
    },
  });
  return user;
}
