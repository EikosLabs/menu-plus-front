/**
 * Utility functions for generating color variants from a primary color
 * Used to auto-generate secondary and accent colors from a single "Color Principal"
 */

/**
 * Convert hex color to HSL
 * @param {string} hex - Hex color string (e.g., "#ff6b35")
 * @returns {object} - { h, s, l } values
 */
function hexToHSL(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL to hex color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color string
 */
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate secondary and accent colors from a primary color
 * - Secondary: Lighter version of primary (good for backgrounds)
 * - Accent: Slightly darker/saturated version (good for highlights)
 * 
 * @param {string} primaryColor - Hex color string
 * @returns {object} - { secondary, accent } hex colors
 */
export function generateColorVariants(primaryColor) {
    if (!primaryColor || typeof primaryColor !== 'string') {
        return {
            secondary: '#f5f5f5',
            accent: '#333333'
        };
    }

    try {
        const hsl = hexToHSL(primaryColor);

        // Secondary: Much lighter version (for backgrounds)
        const secondaryL = Math.min(95, hsl.l + 40);
        const secondaryS = Math.max(10, hsl.s - 30);
        const secondary = hslToHex(hsl.h, secondaryS, secondaryL);

        // Accent: Darker/more saturated version (for highlights)
        const accentL = Math.max(15, hsl.l - 20);
        const accentS = Math.min(100, hsl.s + 10);
        const accent = hslToHex(hsl.h, accentS, accentL);

        return { secondary, accent };
    } catch (error) {
        console.error('Error generating color variants:', error);
        return {
            secondary: '#f5f5f5',
            accent: '#333333'
        };
    }
}

/**
 * Check if a color is valid hex format
 * @param {string} color - Color string to validate
 * @returns {boolean}
 */
export function isValidHexColor(color) {
    if (!color || typeof color !== 'string') return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export default { generateColorVariants, isValidHexColor };
