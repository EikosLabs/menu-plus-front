/**
 * Security utilities for sanitization and validation
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validates and sanitizes URL
 * @param {string} url - URL to validate
 * @param {string} fallback - Fallback URL if invalid
 * @returns {string} Safe URL or fallback
 */
export const sanitizeUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return fallback;
    }
    return url;
  } catch {
    return fallback;
  }
};

/**
 * Validates price format
 * @param {number|string} price - Price to validate
 * @returns {number} Valid price or 0
 */
export const validatePrice = (price) => {
  const parsed = parseFloat(price);
  return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
};

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 200) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Validates and sanitizes menu data
 * @param {Object} menu - Menu object to validate
 * @returns {Object} Sanitized menu data
 */
export const sanitizeMenuData = (menu) => {
  if (!menu || typeof menu !== 'object') {
    return { sections: [], menuItems: [], business: null };
  }

  return {
    sections: Array.isArray(menu.sections) ? menu.sections : [],
    menuItems: Array.isArray(menu.menuItems) ? menu.menuItems : [],
    business: menu.business || null,
  };
};
