/**
 * Template definitions for flyer generation
 * Each template includes layout, styling, and default settings
 */

export const PAPER_SIZES = {
  A4: {
    width: 210, // mm
    height: 297, // mm
    pxWidth: 794, // pixels at 96 DPI
    pxHeight: 1123,
  },
  LETTER: {
    width: 216, // mm (8.5 inches)
    height: 279, // mm (11 inches)
    pxWidth: 816,
    pxHeight: 1056,
  },
  STORY: {
    width: 90, // mm approx for 1080px at ~300DPI equivalent preview
    height: 160, // mm approx for 1920px
    pxWidth: 1080,
    pxHeight: 1920,
  },
};

export const TEMPLATES = {
  CLASSIC: {
    id: 'classic',
    name: 'Clásico',
    description: 'Diseño tradicional con texto simple y legible',
    thumbnail: '📄',
    layout: {
      header: { height: 15 }, // percentage
      content: { columns: 1, gap: 10 },
      footer: { height: 8 },
      margins: { top: 5, right: 5, bottom: 5, left: 5 }, // percentage
    },
    styles: {
      backgroundColor: '#ffffff',
      primaryColor: '#000000',
      secondaryColor: '#666666',
      accentColor: '#333333',
      fontFamily: 'Poppins, sans-serif',
      headerFontSize: 32,
      titleFontSize: 24,
      itemNameFontSize: 14,
      itemDescFontSize: 11,
      priceFontSize: 14,
      borderWidth: 2,
      borderColor: '#000000',
      borderRadius: 0,
    },
    elements: [
      {
        id: 'header-bg',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 15,
        fill: '#f5f5f5',
        locked: true,
      },
      {
        id: 'business-name',
        type: 'text',
        x: 50,
        y: 7.5,
        content: '{businessName}',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000000',
        align: 'center',
        locked: false,
      },
      {
        id: 'menu-name',
        type: 'text',
        x: 50,
        y: 18,
        content: '{menuName}',
        fontSize: 18,
        fontWeight: '600',
        color: '#666666',
        align: 'center',
        locked: false,
      },
      {
        id: 'items-container',
        type: 'container',
        x: 5,
        y: 23,
        width: 90,
        height: 68,
        children: [], // Will be populated with menu items
        layout: 'vertical',
        locked: false,
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 95,
        content: '{contact}',
        fontSize: 10,
        color: '#666666',
        align: 'center',
        locked: false,
      },
    ],
  },

  MODERN: {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño contemporáneo con imágenes y colores vibrantes',
    thumbnail: '🎨',
    layout: {
      header: { height: 20 },
      content: { columns: 2, gap: 15 },
      footer: { height: 6 },
      margins: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    styles: {
      backgroundColor: '#ffffff',
      primaryColor: '{brandPrimary}',
      secondaryColor: '{brandSecondary}',
      accentColor: '{brandAccent}',
      fontFamily: 'Poppins, sans-serif',
      headerFontSize: 36,
      titleFontSize: 20,
      itemNameFontSize: 13,
      itemDescFontSize: 10,
      priceFontSize: 15,
      borderWidth: 0,
      borderColor: 'transparent',
      borderRadius: 8,
      showImages: true,
      imageSize: 80, // pixels
    },
    elements: [
      {
        id: 'header-gradient',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 20,
        fill: 'linear-gradient(135deg, {brandPrimary}, {brandSecondary})',
        locked: true,
      },
      {
        id: 'business-logo',
        type: 'image',
        x: 10,
        y: 10,
        width: 15,
        height: 15,
        src: '{businessLogo}',
        borderRadius: 50,
        locked: false,
      },
      {
        id: 'business-name',
        type: 'text',
        x: 27,
        y: 10,
        content: '{businessName}',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'left',
        locked: false,
      },
      {
        id: 'menu-name',
        type: 'text',
        x: 27,
        y: 15,
        content: '{menuName}',
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        align: 'left',
        locked: false,
      },
      {
        id: 'items-container',
        type: 'container',
        x: 3,
        y: 23,
        width: 94,
        height: 70,
        children: [],
        layout: 'grid',
        columns: 2,
        gap: 15,
        locked: false,
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 96,
        content: '{contact} • {website}',
        fontSize: 9,
        color: '#333333',
        align: 'center',
        locked: false,
      },
    ],
  },

  COMPACT: {
    id: 'compact',
    name: 'Compacto',
    description: 'Maximiza items por página, ideal para menús extensos',
    thumbnail: '📋',
    layout: {
      header: { height: 12 },
      content: { columns: 3, gap: 8 },
      footer: { height: 5 },
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
    },
    styles: {
      backgroundColor: '#fafafa',
      primaryColor: '#000000',
      secondaryColor: '#444444',
      accentColor: '#888888',
      fontFamily: 'Poppins, sans-serif',
      headerFontSize: 28,
      titleFontSize: 16,
      itemNameFontSize: 11,
      itemDescFontSize: 8,
      priceFontSize: 12,
      borderWidth: 1,
      borderColor: '#dddddd',
      borderRadius: 4,
      showImages: false,
      compact: true,
    },
    elements: [
      {
        id: 'header-line',
        type: 'rectangle',
        x: 0,
        y: 11,
        width: 100,
        height: 0.5,
        fill: '#000000',
        locked: true,
      },
      {
        id: 'business-name',
        type: 'text',
        x: 50,
        y: 4,
        content: '{businessName}',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        align: 'center',
        locked: false,
      },
      {
        id: 'menu-name',
        type: 'text',
        x: 50,
        y: 8,
        content: '{menuName}',
        fontSize: 14,
        fontWeight: '500',
        color: '#666666',
        align: 'center',
        locked: false,
      },
      {
        id: 'items-container',
        type: 'container',
        x: 2,
        y: 14,
        width: 96,
        height: 81,
        children: [],
        layout: 'grid',
        columns: 3,
        gap: 8,
        locked: false,
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 97,
        content: '{phone} • {address}',
        fontSize: 8,
        color: '#666666',
        align: 'center',
        locked: false,
      },
    ],
  },

  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    description: 'Fotos grandes y espacios amplios, ideal para platos especiales',
    thumbnail: '✨',
    layout: {
      header: { height: 18 },
      content: { columns: 2, gap: 20 },
      footer: { height: 8 },
      margins: { top: 4, right: 4, bottom: 4, left: 4 },
    },
    styles: {
      backgroundColor: '#ffffff',
      primaryColor: '#1a1a1a',
      secondaryColor: '#c4a962',
      accentColor: '#8b7355',
      fontFamily: 'Poppins, sans-serif',
      headerFontSize: 40,
      titleFontSize: 22,
      itemNameFontSize: 16,
      itemDescFontSize: 12,
      priceFontSize: 18,
      borderWidth: 0,
      borderColor: 'transparent',
      borderRadius: 12,
      showImages: true,
      imageSize: 120,
      spacing: 'generous',
    },
    elements: [
      {
        id: 'header-border',
        type: 'rectangle',
        x: 4,
        y: 4,
        width: 92,
        height: 14,
        fill: 'transparent',
        stroke: '#c4a962',
        strokeWidth: 2,
        locked: true,
      },
      {
        id: 'business-name',
        type: 'text',
        x: 50,
        y: 8,
        content: '{businessName}',
        fontSize: 40,
        fontWeight: 'bold',
        color: '#1a1a1a',
        align: 'center',
        textTransform: 'uppercase',
        letterSpacing: 2,
        locked: false,
      },
      {
        id: 'menu-name',
        type: 'text',
        x: 50,
        y: 13,
        content: '{menuName}',
        fontSize: 18,
        fontWeight: '300',
        color: '#c4a962',
        align: 'center',
        locked: false,
      },
      {
        id: 'decorative-line',
        type: 'rectangle',
        x: 40,
        y: 16,
        width: 20,
        height: 0.3,
        fill: '#c4a962',
        locked: true,
      },
      {
        id: 'items-container',
        type: 'container',
        x: 4,
        y: 20,
        width: 92,
        height: 72,
        children: [],
        layout: 'grid',
        columns: 2,
        gap: 20,
        locked: false,
      },
      {
        id: 'footer-border',
        type: 'rectangle',
        x: 4,
        y: 93,
        width: 92,
        height: 5,
        fill: 'transparent',
        stroke: '#c4a962',
        strokeWidth: 1,
        locked: true,
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 95.5,
        content: '{contact}',
        fontSize: 10,
        color: '#8b7355',
        align: 'center',
        locked: false,
      },
    ],
  },

  MINIMALIST: {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Diseño limpio y elegante con mucho espacio en blanco',
    thumbnail: '⚪',
    layout: {
      header: { height: 15 },
      content: { columns: 1, gap: 12 },
      footer: { height: 6 },
      margins: { top: 8, right: 8, bottom: 8, left: 8 },
    },
    styles: {
      backgroundColor: '#ffffff',
      primaryColor: '#000000',
      secondaryColor: '#333333',
      accentColor: '#999999',
      fontFamily: 'Poppins, sans-serif',
      headerFontSize: 34,
      titleFontSize: 20,
      itemNameFontSize: 14,
      itemDescFontSize: 11,
      priceFontSize: 14,
      borderWidth: 0,
      borderColor: 'transparent',
      borderRadius: 0,
      showImages: false,
      spacing: 'generous',
      lineHeight: 1.8,
    },
    elements: [
      {
        id: 'business-name',
        type: 'text',
        x: 50,
        y: 10,
        content: '{businessName}',
        fontSize: 34,
        fontWeight: '300',
        color: '#000000',
        align: 'center',
        letterSpacing: 4,
        locked: false,
      },
      {
        id: 'separator-line',
        type: 'rectangle',
        x: 45,
        y: 14,
        width: 10,
        height: 0.2,
        fill: '#000000',
        locked: true,
      },
      {
        id: 'menu-name',
        type: 'text',
        x: 50,
        y: 17,
        content: '{menuName}',
        fontSize: 16,
        fontWeight: '400',
        color: '#666666',
        align: 'center',
        locked: false,
      },
      {
        id: 'items-container',
        type: 'container',
        x: 8,
        y: 22,
        width: 84,
        height: 68,
        children: [],
        layout: 'vertical',
        gap: 12,
        locked: false,
      },
      {
        id: 'footer-line',
        type: 'rectangle',
        x: 45,
        y: 92,
        width: 10,
        height: 0.2,
        fill: '#cccccc',
        locked: true,
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 95,
        content: '{contact}',
        fontSize: 9,
        fontWeight: '300',
        color: '#999999',
        align: 'center',
        locked: false,
      },
    ],
  },

  BICOLOR: {
    id: 'bicolor',
    name: 'Bicolor',
    description: 'Contraste fuerte con dos colores principales',
    thumbnail: '🎭',
    layout: {
      header: { height: 25 },
      content: { columns: 2, gap: 10 },
      footer: { height: 7 },
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    styles: {
      backgroundColor: '#ffffff',
      primaryColor: '{brandPrimary}',
      secondaryColor: '#ffffff',
      accentColor: '{brandSecondary}',
      fontFamily: 'Poppins, sans-serif',
      headerFontSize: 38,
      titleFontSize: 22,
      itemNameFontSize: 14,
      itemDescFontSize: 10,
      priceFontSize: 16,
      borderWidth: 3,
      borderColor: '{brandPrimary}',
      borderRadius: 0,
      showImages: true,
      imageSize: 90,
      highContrast: true,
    },
    elements: [
      {
        id: 'header-bg',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 25,
        fill: '{brandPrimary}',
        locked: true,
      },
      {
        id: 'header-triangle',
        type: 'polygon',
        x: 85,
        y: 0,
        points: '0,0 100,0 100,100',
        fill: '{brandSecondary}',
        locked: true,
      },
      {
        id: 'business-name',
        type: 'text',
        x: 10,
        y: 10,
        content: '{businessName}',
        fontSize: 38,
        fontWeight: 'bold',
        color: '#ffffff',
        align: 'left',
        textTransform: 'uppercase',
        locked: false,
      },
      {
        id: 'menu-name',
        type: 'text',
        x: 10,
        y: 18,
        content: '{menuName}',
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        align: 'left',
        locked: false,
      },
      {
        id: 'items-container',
        type: 'container',
        x: 3,
        y: 28,
        width: 94,
        height: 64,
        children: [],
        layout: 'grid',
        columns: 2,
        gap: 10,
        locked: false,
      },
      {
        id: 'footer-bg',
        type: 'rectangle',
        x: 0,
        y: 93,
        width: 100,
        height: 7,
        fill: '{brandPrimary}',
        locked: true,
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 96.5,
        content: '{phone} • {email} • {address}',
        fontSize: 9,
        fontWeight: '600',
        color: '#ffffff',
        align: 'center',
        locked: false,
      },
    ],
  },
};

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  return TEMPLATES[templateId.toUpperCase()] || TEMPLATES.CLASSIC;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return Object.values(TEMPLATES);
}

/**
 * Replace template variables with actual data
 */
export function replacePlaceholders(text, data) {
  if (!text || typeof text !== 'string') return text;

  return text
    .replace('{businessName}', data.businessName || 'Mi Negocio')
    .replace('{menuName}', data.menuName || 'Menú')
    .replace('{businessLogo}', data.businessLogo || '')
    .replace('{brandPrimary}', data.brandPrimary || '#ff6b35')
    .replace('{brandSecondary}', data.brandSecondary || '#f7931e')
    .replace('{brandAccent}', data.brandAccent || '#004e89')
    .replace('{contact}', formatContact(data))
    .replace('{phone}', data.phone || '')
    .replace('{email}', data.email || '')
    .replace('{address}', data.address || '')
    .replace('{website}', data.website || '');
}

/**
 * Format contact information
 */
function formatContact(data) {
  const parts = [];
  if (data.phone) parts.push(data.phone);
  if (data.email) parts.push(data.email);
  if (data.address) parts.push(data.address);
  return parts.join(' • ');
}

/**
 * Convert percentage-based positions to pixels
 */
export function percentToPixels(percent, total) {
  return (percent / 100) * total;
}

/**
 * Convert pixels to percentage
 */
export function pixelsToPercent(pixels, total) {
  return (pixels / total) * 100;
}
