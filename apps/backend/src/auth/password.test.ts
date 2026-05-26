import { checkPasswordStrength, hashPassword, verifyPassword } from './password';

describe('password', () => {
  describe('checkPasswordStrength', () => {
    it('accepts strong passwords', () => {
      expect(checkPasswordStrength('CorrectHorse!Battery1Staple').ok).toBe(true);
    });

    it.each([
      ['short1!A', 'too_short'],
      ['no-upper-1-here!', 'missing_uppercase'],
      ['NO-LOWER-1-HERE!', 'missing_lowercase'],
      ['NoDigitsHereYeah!', 'missing_digit'],
      ['NoSymbols1HereYep', 'missing_symbol'],
    ])('rejects %s as %s', (input, reason) => {
      const result = checkPasswordStrength(input);
      expect(result.ok).toBe(false);
      expect(result.reason).toBe(reason);
    });

    it('rejects common passwords', () => {
      const result = checkPasswordStrength('password');
      expect(result.ok).toBe(false);
    });

    it('rejects passwords containing personal info', () => {
      const result = checkPasswordStrength('CorrectHorse!Smith1', { lastName: 'Smith' });
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('contains_personal_info');
    });
  });

  describe('hash + verify', () => {
    it('hashes and verifies correctly', async () => {
      const hash = await hashPassword('CorrectHorse!Battery1Staple');
      expect(hash).not.toBe('CorrectHorse!Battery1Staple');
      await expect(verifyPassword('CorrectHorse!Battery1Staple', hash)).resolves.toBe(true);
      await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
    });

    it('rejects empty hash safely', async () => {
      await expect(verifyPassword('whatever', '')).resolves.toBe(false);
    });
  });
});
