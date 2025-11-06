import {
  validateEmail,
  validateUrl,
  validatePhone,
  validateImageFile,
  validateLength,
  validateHexColor,
  validateStepBasicInfo,
  validateStep,
} from './onboardingValidation';

describe('Onboarding Validation Utils', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid email addresses', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
    });

    it('treats empty email as valid (optional)', () => {
      expect(validateEmail('')).toEqual({ isValid: true, error: null });
    });
  });

  describe('validateUrl', () => {
    it('accepts valid https URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid URLs', () => {
      expect(validateUrl('not-a-url').isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('accepts valid phone numbers', () => {
      expect(validatePhone('+1 (555) 123-4567')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('abc').isValid).toBe(false);
    });
  });

  describe('validateImageFile', () => {
    it('accepts valid image types', () => {
      const file = { type: 'image/png', size: 500000 };
      expect(validateImageFile(file)).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid file types', () => {
      const file = { type: 'application/pdf', size: 500000 };
      expect(validateImageFile(file).isValid).toBe(false);
    });

    it('rejects files larger than 1MB', () => {
      const file = { type: 'image/jpeg', size: 2 * 1024 * 1024 };
      expect(validateImageFile(file).isValid).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('validates text within range', () => {
      expect(validateLength('Hello', 2, 10)).toEqual({ isValid: true, error: null });
    });

    it('rejects text shorter than minimum', () => {
      expect(validateLength('Hi', 5, 10).isValid).toBe(false);
    });

    it('rejects text longer than maximum', () => {
      expect(validateLength('This is a very long text', 2, 10).isValid).toBe(false);
    });
  });

  describe('validateHexColor', () => {
    it('accepts valid hex colors', () => {
      expect(validateHexColor('#1a1a1a')).toEqual({ isValid: true, error: null });
      expect(validateHexColor('#fff')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid hex colors', () => {
      expect(validateHexColor('1a1a1a').isValid).toBe(false);
      expect(validateHexColor('').isValid).toBe(false);
    });
  });

  describe('validateStepBasicInfo', () => {
    it('validates correct basic info', () => {
      const formData = {
        name: 'Mi Restaurante',
        description: 'Un lugar especial',
        businessCategoryId: 1,
      };
      expect(validateStepBasicInfo(formData)).toEqual({});
    });

    it('rejects missing required fields', () => {
      const formData = { name: '', businessCategoryId: null };
      const errors = validateStepBasicInfo(formData);
      expect(errors.name).toBeDefined();
      expect(errors.businessCategoryId).toBeDefined();
    });
  });

  describe('validateStep', () => {
    it('validates each step correctly', () => {
      expect(validateStep(1, { name: 'Test', businessCategoryId: 1 })).toEqual({});
      expect(validateStep(2, {})).toEqual({});
      expect(validateStep(99, {})).toEqual({});
    });
  });
});
