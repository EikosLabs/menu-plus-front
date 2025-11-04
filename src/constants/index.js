/**
 * Application Constants
 * Centralized configuration for colors, timeouts, storage keys, and other magic numbers
 */

// Color Palette
export const COLORS = {
  PRIMARY: '#1a1a1a',
  SECONDARY: '#004E71',
  ACCENT: '#0A3342',
  ORANGE: '#E05C33',
  ERROR: '#ef4444',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
};

// API Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_DEFAULT: 10000,
  API_BINARY: 15000,
  IMAGE_UPLOAD: 30000,
  NOTIFICATION: 2000,
  AUTO_SAVE: 30000,
};

// File Size Limits (in bytes)
export const FILE_SIZE = {
  LOGO_MAX: 1048576, // 1MB
  IMAGE_MAX: 1048576, // 1MB
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  LANGUAGE: 'preferred-language',
  ONBOARDING_PREFIX: 'onboarding_progress_',
  NEEDS_ONBOARDING: 'needs_onboarding',
  NEEDS_MENU_ONBOARDING: 'needs_menu_onboarding',
  USER_ID: 'user_id',
};

// Cookie Configuration
export const COOKIE_CONFIG = {
  MAX_AGE: 7200, // 2 hours in seconds
  EXPIRES_DAYS: 7, // 7 days for persistent storage
};

// Time Constants
export const TIME = {
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
};

// Default Values
export const DEFAULTS = {
  PRIMARY_COLOR: COLORS.PRIMARY,
  SECONDARY_COLOR: COLORS.SECONDARY,
  ACCENT_COLOR: COLORS.ACCENT,
  LOCALE: 'es',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.PUBLIC_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    LOGIN: '/api/login',
    REGISTER: '/api/register',
    BUSINESSES: '/api/businesses',
    MENUS: '/api/menus',
    MENU_ITEMS: '/api/menu-items',
  },
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MIN_LENGTH: 10,
  PASSWORD_MIN_LENGTH: 8,
  BUSINESS_NAME_MIN_LENGTH: 2,
  BUSINESS_NAME_MAX_LENGTH: 100,
};
