import {
  sanitizeHtml,
  sanitizeUrl,
  validatePrice,
  truncateText,
  sanitizeMenuData,
} from './security';

describe('Security Utils', () => {
  describe('sanitizeHtml', () => {
    it('sanitizes HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
      expect(sanitizeHtml(input)).toBe(expected);
    });

    it('returns empty string for invalid input', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows valid http and https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('blocks dangerous protocols', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBe('');
    });

    it('returns fallback for invalid URLs', () => {
      expect(sanitizeUrl('invalid', 'https://default.com')).toBe('https://default.com');
    });
  });

  describe('validatePrice', () => {
    it('validates positive numbers', () => {
      expect(validatePrice(10.5)).toBe(10.5);
      expect(validatePrice('25.99')).toBe(25.99);
    });

    it('returns 0 for invalid or negative numbers', () => {
      expect(validatePrice(-10)).toBe(0);
      expect(validatePrice('not a number')).toBe(0);
      expect(validatePrice(null)).toBe(0);
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than maxLength', () => {
      const text = 'A'.repeat(300);
      const result = truncateText(text, 200);
      expect(result.length).toBe(203); // 200 chars + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('does not truncate text shorter than maxLength', () => {
      const text = 'Short text';
      expect(truncateText(text, 200)).toBe(text);
    });

    it('returns empty string for invalid input', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(123)).toBe('');
    });
  });

  describe('sanitizeMenuData', () => {
    it('returns valid menu data structure', () => {
      const menu = {
        sections: [{ id: 1, name: 'Entradas' }],
        menuItems: [{ id: 1, name: 'Item 1' }],
        business: { id: 1, name: 'Restaurant' },
      };

      const result = sanitizeMenuData(menu);
      expect(result).toEqual(menu);
    });

    it('provides defaults for missing or invalid data', () => {
      expect(sanitizeMenuData(null)).toEqual({
        sections: [],
        menuItems: [],
        business: null,
      });

      expect(sanitizeMenuData({ sections: 'invalid' })).toEqual({
        sections: [],
        menuItems: [],
        business: null,
      });
    });
  });
});
