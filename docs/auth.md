# Authentication & Identity

> Phase 3 deliverable. Production-grade JWT auth with refresh-token rotation,
> 2FA, password reset, social login, RBAC, and full audit logging.

## Token model

- **Access token** — short-lived (`JWT_ACCESS_TTL`, default `15m`), HS256-signed,
  carries `sub`, `email`, `role`, `sid`, `type: 'access'`.
- **Refresh token** — long-lived (`JWT_REFRESH_TTL`, default `30d`), HS256-signed,
  carries `sub`, `sid`, `jti`, `type: 'refresh'`.
- The **refresh token** is stored hashed (`sha256`) on the `Session` document and
  returned to the client as a signed, HTTP-only cookie (`ts_rt`).
- Every refresh call **rotates** the token: the presented session is marked
  `revokedAt` and a fresh session document is created. The new refresh token is
  set in a new cookie.

### Refresh token reuse detection

If a refresh token is presented after rotation (or with a hash that doesn't
match the stored one), the auth service:

1. revokes **every** live session for the user,
2. writes an `access_denied` audit log entry,
3. returns `401 REFRESH_REUSE`.

This is the standard mitigation for refresh-token theft — even if the attacker
got hold of the token, they only get one use.

## Endpoints

All endpoints live under `${API_PREFIX}/auth` (default `/api/v1/auth`).

| Method | Path                              | Auth          | Purpose                                  |
| ------ | --------------------------------- | ------------- | ---------------------------------------- |
| POST   | `/register`                       | -             | Create a new customer account            |
| POST   | `/login`                          | -             | Email + password (and 2FA) login         |
| POST   | `/refresh`                        | refresh cookie | Rotate tokens                            |
| POST   | `/logout`                         | bearer        | Revoke current (or all) session(s)       |
| GET    | `/me`                             | bearer        | Return the authenticated user            |
| POST   | `/verify-email`                   | -             | Confirm email via one-time token         |
| POST   | `/resend-verify`                  | -             | Resend the verification email            |
| POST   | `/password/reset/request`         | -             | Email a password-reset link              |
| POST   | `/password/reset`                 | -             | Apply a new password via reset token     |
| POST   | `/password/change`                | bearer        | Change password (and revoke sessions)    |
| POST   | `/2fa/setup`                      | bearer        | Begin 2FA enrollment (returns secret/QR) |
| POST   | `/2fa/confirm`                    | bearer        | Confirm 2FA, return backup codes         |
| POST   | `/2fa/disable`                    | bearer        | Disable 2FA (requires password)          |
| GET    | `/sessions`                       | bearer        | List active sessions                     |
| DELETE | `/sessions/:sessionId`            | bearer        | Revoke a specific session                |
| POST   | `/social`                         | -             | Log in via Google / Facebook / Apple     |

### Sample login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "alex@example.com",
  "password": "CorrectHorse!Battery1Staple"
}
```

Response sets `ts_rt` as a signed HTTP-only cookie (path scoped to `/api/v1/auth`):

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.....",
    "accessExpiresAt": "2026-05-25T22:58:00.000Z",
    "refreshExpiresAt": "2026-06-24T22:43:00.000Z",
    "user": { "id": "...", "email": "alex@example.com", "role": "customer", ... }
  }
}
```

## Password policy

`auth/password.ts` enforces:

- length 12-128
- at least one each of: lowercase, uppercase, digit, symbol
- not in a small list of common passwords
- does **not** contain the user's email, first name, or last name

Hashing uses bcrypt with configurable rounds (`BCRYPT_ROUNDS`, default 12).

## Account lockout

- `User.recordFailedLogin()` increments `failedLoginAttempts` and locks the
  account for **15 minutes** after **10 consecutive failures**.
- A successful login resets the counter.

## Two-factor authentication

- **TOTP** — RFC 6238 via `otplib`, 30-second steps, ±1 window tolerance
  (configurable via `TOTP_WINDOW`).
- **Setup** returns a base32 secret and an `otpauth://` URI rendered to a QR
  data URL via `qrcode`.
- **Backup codes** — 10 codes formatted `XXXX-XXXX`; stored as `sha256` hex
  hashes. Each can be used at most once.
- The 2FA secret + backup hashes use `select: false`, so they never leave the
  server in API responses.

## Sessions

`Session` documents store the refresh-token hash, IP, user-agent, device label,
TTL, and `revokedAt`. Indexes:

- `{ userId: 1, revokedAt: 1 }`
- `{ expiresAt: 1 }` (TTL)
- `{ tokenHash: 1 }` (unique)

Endpoints `/auth/sessions` and `/auth/sessions/:id` let users see and revoke
sessions across devices.

## RBAC

- Roles are a closed enum: `customer < support < staff < manager < admin < superadmin`.
- `requireRole('manager')` — minimum-role guard
- `requireAnyRole('staff', 'support')` — exact set
- `requireSelfOrRole(id => req.params.id, 'staff')` — owner-or-staff
- `requirePermission('products:write')` — fine-grained permission lookup
  through the user's role; cached for 60s in Redis to keep tight request paths
  cheap.

Permission keys live on `Permission` documents and are bundled into roles via
`Role.permissionIds`. The seed script (`pnpm db:seed`) provisions a sane default
set across `customer`, `support`, `staff`, `manager`, `admin`, and `superadmin`.

## Social login

`POST /auth/social` accepts a JSON body with a verified `idToken` (Google,
Apple) or `accessToken` (Facebook). The service:

1. Validates the token with the provider:
   - **Google** — `https://oauth2.googleapis.com/tokeninfo`, audience must
     match `GOOGLE_CLIENT_ID`.
   - **Facebook** — `debug_token` followed by `me?fields=email,first_name,...`.
   - **Apple** — decodes the ID token JWT and validates `iss`, `aud`, `exp`.
     (Full RS256 signature verification against Apple's JWKS is deferred to a
     follow-up hardening pass.)
2. Maps the verified profile to an existing user via `externalIds.{provider}`,
   or by matching `email`, or provisions a new user.
3. Issues an access + refresh token and sets the cookie, identical to the
   email/password flow.

## Audit logging

All security-sensitive events are written to the `auditlogs` collection:

| action            | when                                       |
| ----------------- | ------------------------------------------ |
| `create`          | user self-registers                        |
| `login`           | successful password / social login         |
| `login_failed`    | bad password                               |
| `password_changed`| user changes password (via /change or reset) |
| `update`          | 2FA enable/disable                         |
| `access_denied`   | refresh-token reuse or revoked session     |

Each log row captures `actorId`, `actorRole`, `actorIp`, `userAgent`,
`requestId`, the action target, and (optionally) a `before`/`after` diff.

## Cookies

Refresh cookie defaults (configurable via env):

- `httpOnly: true`
- `secure: isProd || COOKIE_SECURE`
- `sameSite: lax`
- `signed: true` (cookieParser is initialised with `COOKIE_SECRET`)
- `path: ${API_PREFIX}/auth` — never sent to non-auth routes
- `maxAge: JWT_REFRESH_TTL` (30 days default)

## Rate limiting

Three named limiters in `middleware/rate-limit.ts`:

- **`globalRateLimiter`** — applied to every request (`RATE_LIMIT_MAX` per
  `RATE_LIMIT_WINDOW_MS`, default 300 / 15 min).
- **`authRateLimiter`** — `/auth/{register,login,password/reset,social}` —
  10 requests per 15-minute window, keyed by IP + email.
- **`sensitiveRateLimiter`** — `/auth/{resend-verify,password/reset/request}` —
  5 requests per hour, keyed by email.
