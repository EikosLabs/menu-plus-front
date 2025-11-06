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

    it('sanitizes ampersand', () => {
      expect(sanitizeHtml('A & B')).toBe('A &amp; B');
    });

    it('sanitizes quotes', () => {
      expect(sanitizeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
      expect(sanitizeHtml("It's fine")).toBe('It&#x27;s fine');
    });

    it('returns empty string for null or undefined', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeHtml(123)).toBe('');
      expect(sanitizeHtml({})).toBe('');
      expect(sanitizeHtml([])).toBe('');
    });

    it('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows valid http URLs', () => {
      const url = 'http://example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('allows valid https URLs', () => {
      const url = 'https://example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('blocks javascript protocol', () => {
      const url = 'javascript:alert("xss")';
      expect(sanitizeUrl(url)).toBe('');
    });

    it('blocks data protocol', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      expect(sanitizeUrl(url)).toBe('');
    });

    it('returns fallback for invalid URLs', () => {
      const fallback = 'https://fallback.com';
      expect(sanitizeUrl('not a url', fallback)).toBe(fallback);
    });

    it('returns empty string for null or undefined', () => {
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
    });

    it('uses custom fallback when provided', () => {
      expect(sanitizeUrl('invalid', 'https://default.com')).toBe('https://default.com');
    });
  });

  describe('validatePrice', () => {
    it('validates positive numbers', () => {
      expect(validatePrice(10.5)).toBe(10.5);
      expect(validatePrice(100)).toBe(100);
    });

    it('validates string numbers', () => {
      expect(validatePrice('25.99')).toBe(25.99);
      expect(validatePrice('50')).toBe(50);
    });

    it('returns 0 for negative numbers', () => {
      expect(validatePrice(-10)).toBe(0);
      expect(validatePrice('-5.5')).toBe(0);
    });

    it('returns 0 for invalid inputs', () => {
      expect(validatePrice('not a number')).toBe(0);
      expect(validatePrice(NaN)).toBe(0);
      expect(validatePrice(null)).toBe(0);
      expect(validatePrice(undefined)).toBe(0);
    });

    it('validates zero', () => {
      expect(validatePrice(0)).toBe(0);
      expect(validatePrice('0')).toBe(0);
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

    it('handles exact maxLength', () => {
      const text = 'A'.repeat(200);
      expect(truncateText(text, 200)).toBe(text);
    });

    it('uses default maxLength of 200', () => {
      const text = 'A'.repeat(300);
      const result = truncateText(text);
      expect(result.length).toBe(203);
    });

    it('returns empty string for null or undefined', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
    });

    it('returns empty string for non-string input', () => {
      expect(truncateText(123)).toBe('');
      expect(truncateText({})).toBe('');
    });

    it('trims whitespace before adding ellipsis', () => {
      const text = 'A'.repeat(205) + '     '; // 210 total, exceeds 200
      const result = truncateText(text, 200);
      expect(result.endsWith('...')).toBe(true);
      expect(result.includes('     ...')).toBe(false);
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

    it('provides default empty arrays for missing sections', () => {
      const menu = {
        menuItems: [{ id: 1 }],
        business: { id: 1 },
      };

      const result = sanitizeMenuData(menu);
      expect(result.sections).toEqual([]);
      expect(result.menuItems).toEqual(menu.menuItems);
    });

    it('provides default empty arrays for missing menuItems', () => {
      const menu = {
        sections: [{ id: 1 }],
        business: { id: 1 },
      };

      const result = sanitizeMenuData(menu);
      expect(result.menuItems).toEqual([]);
      expect(result.sections).toEqual(menu.sections);
    });

    it('provides null for missing business', () => {
      const menu = {
        sections: [],
        menuItems: [],
      };

      const result = sanitizeMenuData(menu);
      expect(result.business).toBe(null);
    });

    it('returns default structure for null input', () => {
      const result = sanitizeMenuData(null);
      expect(result).toEqual({
        sections: [],
        menuItems: [],
        business: null,
      });
    });

    it('returns default structure for undefined input', () => {
      const result = sanitizeMenuData(undefined);
      expect(result).toEqual({
        sections: [],
        menuItems: [],
        business: null,
      });
    });

    it('converts non-array sections to empty array', () => {
      const menu = {
        sections: 'not an array',
        menuItems: [],
        business: null,
      };

      const result = sanitizeMenuData(menu);
      expect(result.sections).toEqual([]);
    });

    it('converts non-array menuItems to empty array', () => {
      const menu = {
        sections: [],
        menuItems: 'not an array',
        business: null,
      };

      const result = sanitizeMenuData(menu);
      expect(result.menuItems).toEqual([]);
    });
  });
});
