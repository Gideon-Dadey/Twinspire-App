process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ??=
  'test-only-access-secret-please-do-not-use-in-production-environments-1234';
process.env.JWT_REFRESH_SECRET ??=
  'test-only-refresh-secret-please-do-not-use-in-production-environments-5678';
process.env.COOKIE_SECRET ??= 'test-only-cookie-secret-please-replace';
process.env.LOG_LEVEL ??= 'silent';
process.env.LOG_PRETTY = 'false';
process.env.EMAIL_DRIVER ??= 'console';
process.env.ENABLE_SWAGGER ??= 'false';
process.env.BCRYPT_ROUNDS ??= '8';
process.env.RATE_LIMIT_MAX ??= '10000';
process.env.AUTH_RATE_LIMIT_MAX ??= '1000';
