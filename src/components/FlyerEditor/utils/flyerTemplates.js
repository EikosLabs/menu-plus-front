/**
 * Templates for Menu Cards (Cartas) - Full menu printing
 * Auto-generated with business branding - NO IMAGES, only text
 */

export const CARTA_TEMPLATES = {
  elegante: {
    id: 'elegante',
    name: 'Elegante',
    description: 'Diseño clásico y profesional',
    icon: '📋',
    format: 'A4',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    headerHeight: '140px',
    footerHeight: '60px',
    itemSpacing: 'relaxed',
  },

  compacto: {
    id: 'compacto',
    name: 'Compacto',
    description: 'Maximiza items por página',
    icon: '📄',
    format: 'A4',
    itemsPerRow: 2,
    showImages: false,
    imageSize: null,
    headerHeight: '100px',
    footerHeight: '50px',
    itemSpacing: 'compact',
  },

  moderno: {
    id: 'moderno',
    name: 'Moderno',
    description: 'Diseño contemporáneo y limpio',
    icon: '🎨',
    format: 'A4',
    itemsPerRow: 2,
    showImages: false,
    imageSize: null,
    headerHeight: '120px',
    footerHeight: '55px',
    itemSpacing: 'normal',
  },

  minimalista: {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Limpio y espacioso',
    icon: '⚪',
    format: 'A4',
    itemsPerRow: 2,
    showImages: false,
    imageSize: null,
    headerHeight: '100px',
    footerHeight: '45px',
    itemSpacing: 'compact',
  },

  premium: {
    id: 'premium',
    name: 'Premium Dark',
    description: 'Sofisticado y elegante (Fondo oscuro)',
    icon: '💎',
    format: 'A4',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    headerHeight: '160px',
    footerHeight: '70px',
    itemSpacing: 'relaxed',
    style: 'dark',
  },

  bistro: {
    id: 'bistro',
    name: 'Bistro Clásico',
    description: 'Estilo restaurante clásico centrado',
    icon: '🍷',
    format: 'A4',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    headerHeight: '180px',
    footerHeight: '60px',
    itemSpacing: 'normal',
    style: 'centered',
  },

  botanico: {
    id: 'botanico',
    name: 'Botánico Fresh',
    description: 'Fresco y natural',
    icon: '🌿',
    format: 'A4',
    itemsPerRow: 2,
    showImages: false,
    imageSize: null,
    headerHeight: '130px',
    footerHeight: '50px',
    itemSpacing: 'normal',
    style: 'fresh',
  },
};

/**
 * Templates for Promotional Flyers (Folletos) - Promotional prints
 * NO IMAGES - Text-based promotional content with varied aesthetics
 */
export const FOLLETO_TEMPLATES = {
  moderno: {
    id: 'moderno',
    name: 'Moderno Gradiente',
    description: 'Diseño moderno con gradientes vibrantes',
    icon: '🎨',
    format: 'instagram-portrait',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 5,
    headerHeight: '110px',
    footerHeight: '80px',
    style: 'modern',
  },

  minimalista: {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Diseño limpio y elegante',
    icon: '⚪',
    format: 'instagram-portrait',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 6,
    headerHeight: '100px',
    footerHeight: '70px',
    style: 'minimalist',
  },

  elegante: {
    id: 'elegante',
    name: 'Elegante',
    description: 'Sofisticado con bordes decorativos',
    icon: '✨',
    format: 'instagram-portrait',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 5,
    headerHeight: '120px',
    footerHeight: '85px',
    style: 'elegant',
  },

  promocion: {
    id: 'promocion',
    name: 'Promoción Bold',
    description: 'Llamativo para ofertas y descuentos',
    icon: '🎯',
    format: 'instagram-portrait',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 5,
    headerHeight: '110px',
    footerHeight: '85px',
    style: 'promo',
  },

  especiales: {
    id: 'especiales',
    name: 'Especiales del Día',
    description: 'Destaca tus platos especiales',
    icon: '⭐',
    format: 'instagram-portrait',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 4,
    headerHeight: '115px',
    footerHeight: '90px',
    style: 'featured',
  },

  story: {
    id: 'story',
    name: 'Historia IG',
    description: 'Formato vertical 9:16 para stories',
    icon: '📱',
    format: 'story-vertical',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 6,
    headerHeight: '130px',
    footerHeight: '100px',
    style: 'modern',
  },

  storyMinimal: {
    id: 'storyMinimal',
    name: 'Story Minimalista',
    description: 'Historia IG limpia y elegante',
    icon: '📲',
    format: 'story-vertical',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 6,
    headerHeight: '120px',
    footerHeight: '95px',
    style: 'minimalist',
  },

  post: {
    id: 'post',
    name: 'Post IG Cuadrado',
    description: 'Formato 1:1 para feed',
    icon: '⬜',
    format: 'instagram-square',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 4,
    headerHeight: '85px',
    footerHeight: '65px',
    style: 'modern',
  },

  postMinimal: {
    id: 'postMinimal',
    name: 'Post Cuadrado Minimal',
    description: 'Cuadrado minimalista',
    icon: '◻️',
    format: 'instagram-square',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 4,
    headerHeight: '80px',
    footerHeight: '60px',
    style: 'minimalist',
  },
};

/**
 * Format dimensions for all formats (carta + folleto)
 */
export const FOLLETO_FORMATS = {
  'A4': {
    name: 'A4',
    width: 'A4',
    description: 'Formato A4 estándar (210x297mm)',
  },
  'story-vertical': {
    name: 'Historia IG',
    width: 'STORY',
    description: 'Formato vertical 9:16 (1080x1920)',
  },
  'instagram-portrait': {
    name: 'Post IG Vertical',
    width: 'IG_PORTRAIT',
    description: 'Formato vertical 4:5 (1080x1350)',
  },
  'instagram-square': {
    name: 'Post IG Cuadrado',
    width: 'IG_SQUARE',
    description: 'Formato cuadrado 1:1 (1080x1080)',
  },
};

/**
 * Predefined color palettes for different business types
 */
export const COLOR_PALETTES = {
  comidaRapida: {
    id: 'comidaRapida',
    name: 'Comida Rápida',
    icon: '🍔',
    description: 'Colores vibrantes y enérgicos',
    primary: '#FF4444',
    secondary: '#FFC107',
    accent: '#FF6B35',
  },
  cafeEstetico: {
    id: 'cafeEstetico',
    name: 'Café Estético',
    icon: '☕',
    description: 'Tonos cálidos y elegantes',
    primary: '#8B6F47',
    secondary: '#D4A574',
    accent: '#5D4E37',
  },
  restauranteElegante: {
    id: 'restauranteElegante',
    name: 'Restaurante Elegante',
    icon: '🍽️',
    description: 'Negro, dorado y sofisticado',
    primary: '#1A1A1A',
    secondary: '#D4AF37',
    accent: '#8B7355',
  },
  saludable: {
    id: 'saludable',
    name: 'Saludable',
    icon: '🥗',
    description: 'Verdes frescos y naturales',
    primary: '#4CAF50',
    secondary: '#8BC34A',
    accent: '#009688',
  },
  pizzeria: {
    id: 'pizzeria',
    name: 'Pizzería',
    icon: '🍕',
    description: 'Rojo, blanco y verde italiano',
    primary: '#E53935',
    secondary: '#43A047',
    accent: '#FFFFFF',
  },
  postres: {
    id: 'postres',
    name: 'Postres',
    icon: '🍰',
    description: 'Pasteles y tonos dulces',
    primary: '#E91E63',
    secondary: '#FF6EC7',
    accent: '#9C27B0',
  },
  sushi: {
    id: 'sushi',
    name: 'Sushi',
    icon: '🍣',
    description: 'Minimalista japonés',
    primary: '#1A1A1A',
    secondary: '#E53935',
    accent: '#FFC107',
  },
  mexicano: {
    id: 'mexicano',
    name: 'Mexicano',
    icon: '🌮',
    description: 'Colores vibrantes mexicanos',
    primary: '#D32F2F',
    secondary: '#FBC02D',
    accent: '#388E3C',
  },
  marino: {
    id: 'marino',
    name: 'Mariscos',
    icon: '🦞',
    description: 'Azules del mar',
    primary: '#0277BD',
    secondary: '#03A9F4',
    accent: '#00BCD4',
  },
  bar: {
    id: 'bar',
    name: 'Bar/Pub',
    icon: '🍺',
    description: 'Oscuro y moderno',
    primary: '#37474F',
    secondary: '#FF6F00',
    accent: '#C62828',
  },
};

/**
 * Color scheme helper
 */
export function getColorScheme(business, customPalette = null) {
  // If custom palette is provided, use it
  if (customPalette && COLOR_PALETTES[customPalette]) {
    const palette = COLOR_PALETTES[customPalette];
    return {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      text: '#1a1a1a',
      textLight: '#666666',
      background: '#ffffff',
      backgroundAlt: '#f5f5f5',
    };
  }

  // Otherwise use business colors
  return {
    primary: business?.primaryColor || '#ff6b35',
    secondary: business?.secondaryColor || '#f7931e',
    accent: business?.accentColor || '#004e89',
    text: '#1a1a1a',
    textLight: '#666666',
    background: '#ffffff',
    backgroundAlt: '#f5f5f5',
  };
}

/**
 * Get business branding info
 */
export function getBusinessBranding(business) {
  return {
    name: business?.name || 'Mi Negocio',
    logo: business?.logoUri || business?.imageUrl || (business?.logoKey ? `${import.meta.env.PUBLIC_API_URL}/images/${business.logoKey}` : null),
    slogan: business?.slogan || '',
    phone: business?.contactInfo?.phone || business?.phoneNumber || '',
    email: business?.contactInfo?.email || business?.email || '',
    address: business?.contactInfo?.address || business?.address || '',
    facebook: business?.facebookUrl || '',
    instagram: business?.instagramUrl || '',
    whatsapp: business?.whatsAppNumber || '',
    website: business?.website || '',
  };
}

/**
 * Format social media for display
 */
export function formatSocialMedia(branding) {
  const socials = [];

  if (branding.facebook) socials.push({ icon: '📘', text: 'Facebook', url: branding.facebook });
  if (branding.instagram) socials.push({ icon: '📷', text: 'Instagram', url: branding.instagram });
  if (branding.whatsapp) socials.push({ icon: '💬', text: `WhatsApp: ${branding.whatsapp}`, url: `https://wa.me/${branding.whatsapp.replace(/[^0-9]/g, '')}` });

  return socials;
}

/**
 * Format contact info for display
 */
export function formatContactInfo(branding) {
  const contact = [];

  if (branding.phone) contact.push(`📞 ${branding.phone}`);
  if (branding.email) contact.push(`📧 ${branding.email}`);
  if (branding.address) contact.push(`📍 ${branding.address}`);

  return contact;
}
