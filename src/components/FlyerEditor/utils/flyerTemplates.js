/**
 * Templates for Menu Cards (Cartas) - Full menu printing
 * Auto-generated with business branding
 */

export const CARTA_TEMPLATES = {
  elegante: {
    id: 'elegante',
    name: 'Elegante',
    description: 'Diseño clásico y profesional',
    icon: '📋',
    itemsPerRow: 1,
    showImages: true,
    imageSize: 'medium', // small, medium, large
    headerHeight: '180px',
    footerHeight: '80px',
    itemSpacing: 'relaxed',
  },

  compacto: {
    id: 'compacto',
    name: 'Compacto',
    description: 'Maximiza items por página',
    icon: '📄',
    itemsPerRow: 2,
    showImages: false,
    imageSize: null,
    headerHeight: '120px',
    footerHeight: '60px',
    itemSpacing: 'compact',
  },

  moderno: {
    id: 'moderno',
    name: 'Moderno',
    description: 'Con imágenes y diseño actual',
    icon: '🎨',
    itemsPerRow: 2,
    showImages: true,
    imageSize: 'small',
    headerHeight: '160px',
    footerHeight: '70px',
    itemSpacing: 'normal',
  },

  minimalista: {
    id: 'minimalista',
    name: 'Minimalista',
    description: 'Limpio y espacioso',
    icon: '⚪',
    itemsPerRow: 2,
    showImages: false,
    imageSize: null,
    headerHeight: '120px',
    footerHeight: '50px',
    itemSpacing: 'compact',
  },
};

/**
 * Templates for Promotional Flyers (Folletos) - Small promotional prints
 * Smaller format, for selected items only
 */
export const FOLLETO_TEMPLATES = {
  especiales: {
    id: 'especiales',
    name: 'Especiales del Día',
    description: 'Destaca tus platos especiales',
    icon: '⭐',
    format: 'half-page', // half-page, third-page, quarter-page
    itemsPerRow: 1,
    showImages: true,
    imageSize: 'large',
    maxItems: 4,
    headerHeight: '100px',
    footerHeight: '50px',
    style: 'featured', // featured, simple, grid
  },

  promocion: {
    id: 'promocion',
    name: 'Promoción',
    description: 'Ofertas y descuentos',
    icon: '🎯',
    format: 'half-page',
    itemsPerRow: 2,
    showImages: true,
    imageSize: 'medium',
    maxItems: 6,
    headerHeight: '80px',
    footerHeight: '50px',
    style: 'grid',
  },

  combo: {
    id: 'combo',
    name: 'Combo',
    description: 'Menú del día o combo',
    icon: '🍽️',
    format: 'third-page',
    itemsPerRow: 1,
    showImages: true,
    imageSize: 'medium',
    maxItems: 3,
    headerHeight: '90px',
    footerHeight: '60px',
    style: 'simple',
  },

  volante: {
    id: 'volante',
    name: 'Volante',
    description: 'Formato pequeño para repartir',
    icon: '🎫',
    format: 'quarter-page',
    itemsPerRow: 1,
    showImages: false,
    imageSize: null,
    maxItems: 6,
    headerHeight: '60px',
    footerHeight: '40px',
    style: 'simple',
  },

  story: {
    id: 'story',
    name: 'Historia IG',
    description: 'Formato vertical 9:16 para redes',
    icon: '📱',
    format: 'story-vertical',
    itemsPerRow: 1,
    showImages: true,
    imageSize: 'large',
    maxItems: 5,
    headerHeight: '100px',
    footerHeight: '50px',
    style: 'featured',
  },
  post: {
    id: 'post',
    name: 'Post IG',
    description: 'Formato vertical 4:5 para feed',
    icon: '🖼️',
    format: 'instagram-portrait',
    itemsPerRow: 1,
    showImages: true,
    imageSize: 'large',
    maxItems: 5,
    headerHeight: '90px',
    footerHeight: '45px',
    style: 'featured',
  },
};

/**
 * Format dimensions for folletos
 */
export const FOLLETO_FORMATS = {
  'half-page': {
    name: 'Media Página',
    width: 'A5', // 148 x 210 mm
    description: 'Ideal para menú del día',
  },
  'third-page': {
    name: 'Tercio de Página',
    width: 'custom',
    dimensions: { width: 99, height: 210 }, // mm
    description: 'Perfecto para combos',
  },
  'quarter-page': {
    name: 'Cuarto de Página',
    width: 'A6', // 105 x 148 mm
    description: 'Volante para repartir',
  },
  'story-vertical': {
    name: 'Historia IG',
    width: 'STORY',
    description: 'Formato vertical 9:16 (1080x1920)',
  },
  'instagram-portrait': {
    name: 'Post IG',
    width: 'IG_PORTRAIT',
    description: 'Formato vertical 4:5 (1080x1350)',
  },
};

/**
 * Color scheme helper
 */
export function getColorScheme(business) {
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
    logo: business?.logoUri || (business?.logoKey ? `${import.meta.env.PUBLIC_API_URL}/images/${business.logoKey}` : null),
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
