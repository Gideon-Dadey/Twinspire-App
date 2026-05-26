import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth-schemas';

describe('auth-schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid email + password', () => {
      const result = loginSchema.safeParse({
        email: 'demo@twinspire.dev',
        password: 'TwinSpire!2026',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid emails', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' });
      expect(result.success).toBe(false);
    });

    it('rejects a non-6-digit totp code', () => {
      const result = loginSchema.safeParse({
        email: 'demo@twinspire.dev',
        password: 'TwinSpire!2026',
        totpCode: '123',
      });
      expect(result.success).toBe(false);
    });

    it('allows an empty totp code', () => {
      const result = loginSchema.safeParse({
        email: 'demo@twinspire.dev',
        password: 'TwinSpire!2026',
        totpCode: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('registerSchema', () => {
    const validInput = {
      firstName: 'Demo',
      lastName: 'Buyer',
      email: 'demo@twinspire.dev',
      password: 'TwinSpire!2026',
      confirmPassword: 'TwinSpire!2026',
      marketingOptIn: false,
      terms: true as const,
    };

    it('accepts a strong matching password and ticked terms', () => {
      expect(registerSchema.safeParse(validInput).success).toBe(true);
    });

    it('rejects when passwords do not match', () => {
      const result = registerSchema.safeParse({ ...validInput, confirmPassword: 'different!' });
      expect(result.success).toBe(false);
    });

    it('rejects a weak password (missing symbol)', () => {
      const result = registerSchema.safeParse({
        ...validInput,
        password: 'TwinSpire2026',
        confirmPassword: 'TwinSpire2026',
      });
      expect(result.success).toBe(false);
    });

    it('rejects when terms are not accepted', () => {
      const result = registerSchema.safeParse({ ...validInput, terms: false as unknown as true });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('requires a valid email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'demo@twinspire.dev' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('mirrors register password rules', () => {
      const ok = resetPasswordSchema.safeParse({
        password: 'TwinSpire!2026',
        confirmPassword: 'TwinSpire!2026',
      });
      expect(ok.success).toBe(true);
      const bad = resetPasswordSchema.safeParse({
        password: 'short',
        confirmPassword: 'short',
      });
      expect(bad.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('requires current + new + matching confirm', () => {
      const ok = changePasswordSchema.safeParse({
        currentPassword: 'TwinSpire!2026',
        newPassword: 'NewerSpire!2026',
        confirmPassword: 'NewerSpire!2026',
      });
      expect(ok.success).toBe(true);
    });

    it('rejects mismatched confirm', () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: 'TwinSpire!2026',
        newPassword: 'NewerSpire!2026',
        confirmPassword: 'NewerSpire!2027',
      });
      expect(result.success).toBe(false);
    });
  });
});
