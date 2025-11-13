import { sanitizeMenuData, sanitizeColor } from './security.js';
import { renderMenu } from './menuRenderer.js';
import { initializeInteractiveElements } from './menuInteractions.js';

const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

function getContrastColor(hex, alphaFactor = 1) {
  try {
    const clean = hex.replace('#','');
    const r = parseInt(clean.length === 3 ? clean[0]+clean[0] : clean.substring(0,2), 16) / 255;
    const g = parseInt(clean.length === 3 ? clean[1]+clean[1] : clean.substring(2,4), 16) / 255;
    const b = parseInt(clean.length === 3 ? clean[2]+clean[2] : clean.substring(4,6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const color = lum > 0.5 ? '#111111' : '#FFFFFF';
    if (color === '#FFFFFF' && alphaFactor < 1) {
      return `rgba(255,255,255,${alphaFactor})`;
    }
    if (color === '#111111' && alphaFactor < 1) {
      return `rgba(17,17,17,${alphaFactor})`;
    }
    return color;
  } catch { return '#FFFFFF'; }
}

function applyTheme(business) {
  const templateMap = {
    '0': 'modern', '1': 'elegant', '2': 'casual', '3': 'minimalist',
    '4': 'colorful', '5': 'dark', '6': 'classic'
  };

  const templateName = templateMap[String(business.template)] || 'modern';
  document.documentElement.setAttribute('data-template', templateName);

  const fontMap = {
    'poppins': "'Poppins', sans-serif",
    'playfair': "'Playfair Display', serif",
    'roboto': "'Roboto', sans-serif",
    'montserrat': "'Montserrat', sans-serif",
    'lora': "'Lora', serif",
    'opensans': "'Open Sans', sans-serif",
    'raleway': "'Raleway', sans-serif",
    'merriweather': "'Merriweather', serif"
  };

  const fontFamily = (business.fontFamily || 'poppins').toLowerCase();
  const fontFamilyValue = fontMap[fontFamily] || fontMap['poppins'];

  const customColors = {
    primary: sanitizeColor(business.primaryColor) || null,
    secondary: sanitizeColor(business.secondaryColor) || null,
    accent: sanitizeColor(business.accentColor) || null
  };

  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    :root {
      ${customColors.primary ? `--primary-dark: ${customColors.primary};` : ''}
      ${customColors.secondary ? `--secondary-dark: ${customColors.secondary};` : ''}
      ${customColors.accent ? `--accent-gold: ${customColors.accent};` : ''}
      --font-display: ${fontFamilyValue};
      ${customColors.primary ? `--hero-text-color: ${getContrastColor(customColors.primary)};` : '--hero-text-color: #ffffff;'}
      ${customColors.primary ? `--hero-subtitle-color: ${getContrastColor(customColors.primary, 0.85)};` : '--hero-subtitle-color: rgba(255,255,255,0.95);'}
    }

    body, .menu-page, * { font-family: ${fontFamilyValue} !important; }

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

    const itemsBySection = {};
    menu.sections.forEach((section) => {
      const key = String(section.id).toLowerCase();
      itemsBySection[key] = section.menuItems || [];
    });

    if (menu.menuItems?.length) {
      itemsBySection['no-section'] = menu.menuItems;
    }

    renderMenu(menu, business, itemsBySection);

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

  } catch (error) {
    console.error('Error loading menu:', error);
    loadingState.style.display = 'none';
    errorState.style.display = 'flex';
    document.getElementById('error-message').textContent = error.message;
  }
}
