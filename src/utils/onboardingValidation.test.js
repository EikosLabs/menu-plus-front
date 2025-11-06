import {
  validateEmail,
  validateUrl,
  validatePhone,
  validateImageFile,
  validateLength,
  validateRequired,
  validateHexColor,
  validateStepBasicInfo,
  validateStepLogo,
  validateStepContact,
  validateStepSocial,
  validateStepColors,
  validateStep,
} from './onboardingValidation';

describe('Onboarding Validation Utils', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ isValid: true, error: null });
      expect(validateEmail('user.name@domain.co.uk')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid email addresses', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Por favor ingresa un email válido');
    });

    it('treats empty email as valid (optional)', () => {
      expect(validateEmail('')).toEqual({ isValid: true, error: null });
      expect(validateEmail(null)).toEqual({ isValid: true, error: null });
    });
  });

  describe('validateUrl', () => {
    it('accepts valid http and https URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({ isValid: true, error: null });
      expect(validateUrl('http://example.com')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid URLs', () => {
      const result = validateUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Por favor ingresa una URL válida (https://...)');
    });

    it('rejects non-http protocols', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Por favor ingresa una URL válida (https://...)');
    });

    it('treats empty URL as valid (optional)', () => {
      expect(validateUrl('')).toEqual({ isValid: true, error: null });
      expect(validateUrl(null)).toEqual({ isValid: true, error: null });
    });
  });

  describe('validatePhone', () => {
    it('accepts valid phone numbers', () => {
      expect(validatePhone('1234567890')).toEqual({ isValid: true, error: null });
      expect(validatePhone('+1 (555) 123-4567')).toEqual({ isValid: true, error: null });
      expect(validatePhone('+52 55 1234 5678')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid phone numbers', () => {
      const result = validatePhone('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Por favor ingresa un número de teléfono válido');
    });

    it('rejects too short phone numbers', () => {
      const result = validatePhone('123');
      expect(result.isValid).toBe(false);
    });

    it('treats empty phone as valid (optional)', () => {
      expect(validatePhone('')).toEqual({ isValid: true, error: null });
    });
  });

  describe('validateImageFile', () => {
    it('accepts valid image types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      validTypes.forEach(type => {
        const file = { type, size: 500000 };
        expect(validateImageFile(file)).toEqual({ isValid: true, error: null });
      });
    });

    it('rejects invalid file types', () => {
      const file = { type: 'application/pdf', size: 500000 };
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Formato de archivo no válido (solo JPEG, PNG, GIF, WebP)');
    });

    it('rejects files larger than 1MB', () => {
      const file = { type: 'image/jpeg', size: 2 * 1024 * 1024 };
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El archivo es demasiado grande (máximo 1MB)');
    });

    it('treats null file as valid (optional)', () => {
      expect(validateImageFile(null)).toEqual({ isValid: true, error: null });
    });
  });

  describe('validateLength', () => {
    it('validates text within range', () => {
      expect(validateLength('Hello', 2, 10)).toEqual({ isValid: true, error: null });
    });

    it('rejects text shorter than minimum', () => {
      const result = validateLength('Hi', 5, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Debe tener al menos 5 caracteres');
    });

    it('rejects text longer than maximum', () => {
      const result = validateLength('This is a very long text', 2, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No puede exceder 10 caracteres');
    });

    it('handles empty text with min > 0', () => {
      const result = validateLength('', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Este campo es requerido');
    });

    it('trims whitespace when checking length', () => {
      expect(validateLength('  text  ', 3, 10)).toEqual({ isValid: true, error: null });
    });
  });

  describe('validateRequired', () => {
    it('accepts non-empty values', () => {
      expect(validateRequired('value')).toEqual({ isValid: true, error: null });
      expect(validateRequired(0)).toEqual({ isValid: true, error: null });
      expect(validateRequired(false)).toEqual({ isValid: true, error: null });
    });

    it('rejects empty values', () => {
      const result = validateRequired('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Este campo es requerido');
    });

    it('uses custom field name in error message', () => {
      const result = validateRequired('', 'El nombre');
      expect(result.error).toBe('El nombre es requerido');
    });

    it('rejects null and undefined', () => {
      expect(validateRequired(null).isValid).toBe(false);
      expect(validateRequired(undefined).isValid).toBe(false);
    });
  });

  describe('validateHexColor', () => {
    it('accepts valid 6-digit hex colors', () => {
      expect(validateHexColor('#1a1a1a')).toEqual({ isValid: true, error: null });
      expect(validateHexColor('#FFFFFF')).toEqual({ isValid: true, error: null });
    });

    it('accepts valid 3-digit hex colors', () => {
      expect(validateHexColor('#fff')).toEqual({ isValid: true, error: null });
      expect(validateHexColor('#ABC')).toEqual({ isValid: true, error: null });
    });

    it('rejects invalid hex colors', () => {
      const result = validateHexColor('1a1a1a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Por favor ingresa un color hexadecimal válido (ej: #1a1a1a)');
    });

    it('rejects colors with invalid characters', () => {
      expect(validateHexColor('#GGGGGG').isValid).toBe(false);
    });

    it('rejects empty color', () => {
      const result = validateHexColor('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Color es requerido');
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

    it('rejects missing name', () => {
      const formData = { name: '', businessCategoryId: 1 };
      const errors = validateStepBasicInfo(formData);
      expect(errors.name).toBeDefined();
    });

    it('rejects too short name', () => {
      const formData = { name: 'A', businessCategoryId: 1 };
      const errors = validateStepBasicInfo(formData);
      expect(errors.name).toBe('Debe tener al menos 2 caracteres');
    });

    it('rejects missing category', () => {
      const formData = { name: 'Mi Restaurante' };
      const errors = validateStepBasicInfo(formData);
      expect(errors.businessCategoryId).toBe('La categoría es requerido');
    });

    it('rejects too long description', () => {
      const formData = {
        name: 'Mi Restaurante',
        description: 'A'.repeat(600),
        businessCategoryId: 1,
      };
      const errors = validateStepBasicInfo(formData);
      expect(errors.description).toBeDefined();
    });
  });

  describe('validateStepLogo', () => {
    it('accepts valid logo file', () => {
      const formData = {
        logoFile: { type: 'image/png', size: 500000 },
      };
      expect(validateStepLogo(formData)).toEqual({});
    });

    it('accepts missing logo (optional)', () => {
      expect(validateStepLogo({})).toEqual({});
    });

    it('rejects invalid file type', () => {
      const formData = {
        logoFile: { type: 'application/pdf', size: 500000 },
      };
      const errors = validateStepLogo(formData);
      expect(errors.logoFile).toBeDefined();
    });
  });

  describe('validateStepContact', () => {
    it('validates correct contact info', () => {
      const formData = {
        email: 'test@example.com',
        phoneNumber: '+1234567890',
      };
      expect(validateStepContact(formData)).toEqual({});
    });

    it('accepts empty contact info (optional)', () => {
      expect(validateStepContact({})).toEqual({});
    });

    it('rejects invalid email', () => {
      const formData = { email: 'invalid-email' };
      const errors = validateStepContact(formData);
      expect(errors.email).toBeDefined();
    });

    it('rejects invalid phone', () => {
      const formData = { phoneNumber: 'abc' };
      const errors = validateStepContact(formData);
      expect(errors.phoneNumber).toBeDefined();
    });
  });

  describe('validateStepSocial', () => {
    it('validates correct social URLs', () => {
      const formData = {
        facebookUrl: 'https://facebook.com/page',
        instagramUrl: 'https://instagram.com/user',
        twitterUrl: 'https://twitter.com/user',
        whatsAppNumber: '+1234567890',
      };
      expect(validateStepSocial(formData)).toEqual({});
    });

    it('accepts empty social info (optional)', () => {
      expect(validateStepSocial({})).toEqual({});
    });

    it('rejects invalid URLs', () => {
      const formData = {
        facebookUrl: 'not-a-url',
        instagramUrl: 'invalid',
      };
      const errors = validateStepSocial(formData);
      expect(errors.facebookUrl).toBeDefined();
      expect(errors.instagramUrl).toBeDefined();
    });

    it('rejects invalid WhatsApp number', () => {
      const formData = { whatsAppNumber: 'abc' };
      const errors = validateStepSocial(formData);
      expect(errors.whatsAppNumber).toBeDefined();
    });
  });

  describe('validateStepColors', () => {
    it('validates correct colors', () => {
      const formData = {
        primaryColor: '#1a1a1a',
        secondaryColor: '#ffffff',
        accentColor: '#ff6b6b',
      };
      expect(validateStepColors(formData)).toEqual({});
    });

    it('rejects missing colors', () => {
      const formData = {};
      const errors = validateStepColors(formData);
      expect(errors.primaryColor).toBeDefined();
      expect(errors.secondaryColor).toBeDefined();
      expect(errors.accentColor).toBeDefined();
    });

    it('rejects invalid color format', () => {
      const formData = {
        primaryColor: 'blue',
        secondaryColor: '#fff',
        accentColor: '#ff6b6b',
      };
      const errors = validateStepColors(formData);
      expect(errors.primaryColor).toBeDefined();
    });
  });

  describe('validateStep', () => {
    it('validates step 1', () => {
      const formData = { name: 'Test', businessCategoryId: 1 };
      expect(validateStep(1, formData)).toEqual({});
    });

    it('validates step 2', () => {
      const formData = {};
      expect(validateStep(2, formData)).toEqual({});
    });

    it('validates step 3', () => {
      const formData = {};
      expect(validateStep(3, formData)).toEqual({});
    });

    it('validates step 4', () => {
      const formData = {};
      expect(validateStep(4, formData)).toEqual({});
    });

    it('validates step 5', () => {
      const formData = {
        primaryColor: '#000',
        secondaryColor: '#fff',
        accentColor: '#f00',
      };
      expect(validateStep(5, formData)).toEqual({});
    });

    it('returns empty object for invalid step number', () => {
      expect(validateStep(99, {})).toEqual({});
    });
  });
});
