import { sanitizeMenuData, sanitizeColor } from './security.js';
import { renderMenu } from './menuRenderer.js';
import { initializeInteractiveElements } from './menuInteractions.js';
import { getPaletteByBusinessType } from './themePalettes.js';
import { initCartUI, addToCartFromItem } from './cartUI.js';

const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

function getContrastColor(hex, alphaFactor = 1) {
  try {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;

    // Calculate relative luminance
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Use a slightly lower threshold for better readability on colored backgrounds
    // This prefers white text on more backgrounds
    const color = lum > 0.6 ? '#111111' : '#FFFFFF';

    if (color === '#FFFFFF' && alphaFactor < 1) {
      return `rgba(255,255,255,${alphaFactor})`;
    }
    if (color === '#111111' && alphaFactor < 1) {
      return `rgba(17,17,17,${alphaFactor})`;
    }
    return color;
  } catch { return '#FFFFFF'; }
}

function hexToRgba(hex, alpha = 1) {
  try {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16);
    const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16);
    const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch { return `rgba(0,0,0,${alpha})`; }
}

// Helper to darken/lighten color
function adjustColorBrightness(hex, percent) {
  try {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  } catch { return hex; }
}

// Foreground color for background to maximize contrast
function getForegroundOnBackground(hex) {
  try {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.6 ? '#111111' : '#FFFFFF';
  } catch { return '#111111'; }
}

// Helper to ensure text color is readable on light background
function getReadableTextColor(hex) {
  try {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.substring(4, 6), 16) / 255;

    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If color is too light (lum > 0.4), return a dark gray/black
    // Otherwise return the color itself
    return lum > 0.4 ? '#1a1a1a' : hex;
  } catch { return '#1a1a1a'; }
}

function applyTheme(business) {
  const templateMap = {
    '0': 'modern', '1': 'elegant', '2': 'casual', '3': 'minimalist',
    '4': 'colorful', '5': 'dark', '6': 'classic'
  };

  const templateName = templateMap[String(business.template)] || 'modern';
  document.documentElement.setAttribute('data-template', templateName);

  const businessType = business.businessType || business.category || 'restaurant';
  const palette = getPaletteByBusinessType(businessType);

  const fontMap = {
    'poppins': "'Poppins', sans-serif",
    'playfair display': "'Playfair Display', serif", // Add explicit support
    'playfair': "'Playfair Display', serif",
    'roboto': "'Roboto', sans-serif",
    'montserrat': "'Montserrat', sans-serif",
    'lora': "'Lora', serif",
    'open sans': "'Open Sans', sans-serif", // Add explicit support
    'opensans': "'Open Sans', sans-serif",
    'raleway': "'Raleway', sans-serif",
    'merriweather': "'Merriweather', serif"
  };

  const fontFamilyName = (business.fontFamily || palette.fontFamily || 'poppins').toLowerCase().replace(/'/g, "").replace(/"/g, "");
  const fontFamilyValue = fontMap[fontFamilyName] || fontMap['poppins'];

  const customColors = {
    primary: sanitizeColor(business.primaryColor) || palette.primary,
    secondary: sanitizeColor(business.secondaryColor) || palette.secondary,
    accent: sanitizeColor(business.accentColor) || palette.accent
  };
  const backgroundColor = sanitizeColor(business.backgroundColor) || palette.background;
  const pageText = getForegroundOnBackground(backgroundColor || '#ffffff');
  const pageMuted = pageText === '#FFFFFF' ? 'rgba(255,255,255,0.78)' : 'rgba(17,17,17,0.74)';

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    :root {
      ${customColors.primary ? `--primary-dark: ${customColors.primary};` : ''}
      ${customColors.secondary ? `--secondary-dark: ${customColors.secondary};` : ''}
      ${customColors.accent ? `--accent-gold: ${customColors.accent};` : ''}
      ${customColors.primary ? `--brand-primary: ${customColors.primary};` : ''}
      ${customColors.secondary ? `--brand-secondary: ${customColors.secondary};` : ''}
      ${customColors.accent ? `--brand-accent: ${customColors.accent};` : ''}
      ${backgroundColor ? `--brand-background: ${backgroundColor};` : ''}
      --brand-border-radius: ${business.borderRadius || 12}px;
      ${backgroundColor ? `--page-text-color: ${pageText};` : '--page-text-color: #111111;'}
      ${backgroundColor ? `--page-muted-text-color: ${pageMuted};` : '--page-muted-text-color: rgba(17,17,17,0.74);'}
      ${customColors.primary ? `--brand-primary-contrast: ${getContrastColor(customColors.primary)};` : '--brand-primary-contrast: #ffffff;'}
      ${customColors.secondary ? `--brand-secondary-contrast: ${getContrastColor(customColors.secondary)};` : '--brand-secondary-contrast: #ffffff;'}
      ${customColors.accent ? `--brand-accent-contrast: ${getContrastColor(customColors.accent)};` : '--brand-accent-contrast: #ffffff;'}
      ${customColors.primary ? `--brand-shadow-color: ${hexToRgba(customColors.primary, 0.25)};` : '--brand-shadow-color: rgba(0,0,0,0.2);'}
      --font-display: ${fontFamilyValue};
      ${backgroundColor ? `--hero-text-color: ${getForegroundOnBackground(backgroundColor)};` : '--hero-text-color: #111111;'}
      ${backgroundColor ? `--hero-subtitle-color: ${getForegroundOnBackground(backgroundColor) === '#FFFFFF' ? 'rgba(255,255,255,0.78)' : 'rgba(17,17,17,0.74)'};` : '--hero-subtitle-color: rgba(17,17,17,0.74);'}
      
      /* Readable Text Colors for Light Backgrounds */
      ${customColors.primary ? `--brand-primary-text: ${getReadableTextColor(customColors.primary)};` : '--brand-primary-text: #1a1a1a;'}
      ${customColors.secondary ? `--brand-secondary-text: ${getReadableTextColor(customColors.secondary)};` : '--brand-secondary-text: #4a4a4a;'}
      ${customColors.accent ? `--brand-accent-text: ${getReadableTextColor(customColors.accent)};` : '--brand-accent-text: #1a1a1a;'}

      /* Derived colors for better UI */
      ${customColors.primary ? `--brand-primary-light: ${adjustColorBrightness(customColors.primary, 20)};` : ''}
      ${customColors.primary ? `--brand-primary-dark: ${adjustColorBrightness(customColors.primary, -20)};` : ''}
    }

    body, .menu-page, * { font-family: ${fontFamilyValue} !important; }
 
     .category-chip.active { 
         background: var(--brand-primary) !important; 
         color: var(--brand-primary-contrast) !important;
         border-color: var(--brand-primary) !important;
     }
    
    .category-chip:not(.active) {
        border: 2px solid var(--brand-primary) !important;
        color: var(--brand-primary) !important;
        background: transparent !important;
    }
    
    .category-chip:not(.active):hover {
        background: var(--brand-primary-light) !important;
        color: var(--brand-primary-contrast) !important;
        border-color: var(--brand-primary-light) !important;
    }

    .hero-title-main, .section-title, .item-name, .dish-modal-title,
    .loading-title, .error-title, .empty-title, .footer-logo,
    .category-chip, .item-price, .category-name, .section-description,
    .item-description, .dish-modal-description, .footer-text {
      font-family: ${fontFamilyValue} !important;
    }
  `;
  document.head.appendChild(styleEl);
}

export async function loadMenu(qrCodeId) {
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const menuContent = document.getElementById('menu-content');

  try {
    if (!qrCodeId || qrCodeId.trim() === '') {
      throw new Error('Invalid QR code. Please scan a valid QR code.');
    }

    const response = await fetch(`${API_URL}/menus/qr-code/${qrCodeId}`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      let errorMessage = `Unable to load menu (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch {
        if (response.status === 400) {
          errorMessage = 'Invalid QR code format. Please scan the QR code again or contact support.';
        } else if (response.status === 404) {
          errorMessage = 'Menu not found. Please verify the QR code or contact the restaurant.';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const menu = sanitizeMenuData(data);
    const business = menu.business;

    document.title = business?.name || 'Menu';

    if (business) {
      applyTheme(business);
    }

    // Filtrar secciones duplicadas por ID
    const uniqueSections = [];
    const seenIds = new Set();
    const itemsBySection = {};

    console.log('Secciones originales recibidas:', menu.sections.length);
    console.log('IDs de secciones recibidas:', menu.sections.map(s => ({ id: s.id, name: s.name })));

    menu.sections.forEach((section) => {
      const sectionId = String(section.id).toLowerCase();

      if (!seenIds.has(sectionId)) {
        seenIds.add(sectionId);
        uniqueSections.push(section);
        itemsBySection[sectionId] = section.menuItems || [];
      } else {
        console.warn('Sección duplicada detectada y eliminada:', section.id, section.name);
      }
    });

    console.log('Secciones únicas después de filtrar:', uniqueSections.length);

    if (menu.menuItems?.length) {
      itemsBySection['no-section'] = menu.menuItems;
    }

    // Usar menú con secciones únicas filtradas
    const filteredMenu = { ...menu, sections: uniqueSections };
    renderMenu(filteredMenu, business, itemsBySection);

    loadingState.style.display = 'none';
    menuContent.style.display = 'block';

    // Trigger animations
    setTimeout(() => {
      document.querySelectorAll('.menu-item').forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate-in');
        }, index * 50);
      });
    }, 100);

    initializeInteractiveElements();

    // Initialize Cart UI
    initCartUI(business);

    // Add to cart button click handlers
    document.querySelectorAll('.item-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening item modal
        const item = btn.closest('.menu-item');
        if (item) {
          const itemData = {
            id: item.dataset.itemId,
            name: item.dataset.itemName,
            price: parseFloat(item.dataset.itemPrice),
            currency: item.dataset.itemCurrency
          };
          addToCartFromItem(itemData);
        }
      });
    });

  } catch (error) {
    console.error('Error loading menu:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'flex';
    document.getElementById('error-message').textContent = error.message;
  }
}
