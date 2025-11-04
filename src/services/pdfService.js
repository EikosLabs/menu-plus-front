/**
 * PDF Generation Service
 * Handles PDF generation for brochures with multiple templates
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from brochure configuration
 * @param {Object} config - Brochure configuration
 * @param {HTMLElement} element - DOM element to convert to PDF
 * @returns {Promise<void>}
 */
export async function generateBrochurePDF(config, element) {
  if (!element) {
    throw new Error('Element not found for PDF generation');
  }

  const { pageFormat, business, title } = config;

  // Page dimensions in mm
  const dimensions = pageFormat === 'A4'
    ? { width: 210, height: 297 }
    : { width: 216, height: 279 };

  try {
    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      allowTaint: true
    });

    // Calculate dimensions to fit the page
    const imgWidth = dimensions.width;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageFormat.toLowerCase()
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Handle multi-page if content is too long
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= dimensions.height;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= dimensions.height;
    }

    // Generate filename
    const filename = `${business?.name || 'menu'}_${title || 'brochure'}_${Date.now()}.pdf`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    // Save PDF
    pdf.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol
 * @returns {string}
 */
export function formatPrice(price, currency = '$') {
  if (price === null || price === undefined) return '';
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Get image URL or fallback
 * @param {string} imageUri - Image URI
 * @param {string} fallback - Fallback image
 * @returns {string}
 */
export function getImageUrl(imageUri, fallback = '/placeholder-food.jpg') {
  if (!imageUri) return fallback;
  // Handle relative and absolute URLs
  if (imageUri.startsWith('http')) return imageUri;
  return imageUri.startsWith('/') ? imageUri : `/${imageUri}`;
}

/**
 * Truncate text to max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
}

/**
 * Sort items by order property
 * @param {Array} items - Items to sort
 * @returns {Array}
 */
export function sortByOrder(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Validate brochure configuration
 * @param {Object} config - Brochure configuration
 * @returns {Object} Validation result
 */
export function validateBrochureConfig(config) {
  const errors = [];

  if (!config) {
    errors.push('Configuration is required');
    return { valid: false, errors };
  }

  if (!config.business) {
    errors.push('Business information is required');
  }

  if (!config.elements || config.elements.length === 0) {
    errors.push('At least one element is required');
  }

  if (!config.template) {
    errors.push('Template is required');
  }

  if (!config.pageFormat) {
    errors.push('Page format is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  generateBrochurePDF,
  formatPrice,
  getImageUrl,
  truncateText,
  sortByOrder,
  validateBrochureConfig
};
