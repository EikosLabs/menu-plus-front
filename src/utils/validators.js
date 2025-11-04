/**
 * Utilidades de validación centralizadas
 * Consolidación de validaciones duplicadas en el proyecto
 */

// Configuración de validación de imágenes
const IMAGE_VALIDATION_CONFIG = {
  validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 1024 * 1024, // 1MB
  defaultError: 'Formato de archivo no válido'
};

/**
 * Valida formato de email con regex robusto
 * @param {string} email - Email a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: true, error: null };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  return {
    isValid,
    error: isValid ? null : 'Por favor ingresa un email válido'
  };
};

/**
 * Valida archivo de imagen (tipo y tamaño)
 * @param {File} file - Archivo a validar
 * @param {Object} options - Opciones personalizadas
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateImageFile = (file, options = {}) => {
  if (!file) return { isValid: true, error: null };

  const config = { ...IMAGE_VALIDATION_CONFIG, ...options };

  if (!config.validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de archivo no válido (solo JPEG, PNG, GIF, WebP)'
    };
  }

  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `El archivo es demasiado grande (máximo ${maxSizeMB}MB)`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida formato de URL
 * @param {string} url - URL a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateUrl = (url) => {
  if (!url) return { isValid: true, error: null };

  try {
    const urlObj = new URL(url);
    const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';

    return {
      isValid,
      error: isValid ? null : 'Por favor ingresa una URL válida (https://...)'
    };
  } catch {
    return {
      isValid: false,
      error: 'Por favor ingresa una URL válida (https://...)'
    };
  }
};

/**
 * Valida formato de número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, error: null };

  const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
  const isValid = phoneRegex.test(phone);

  return {
    isValid,
    error: isValid ? null : 'Por favor ingresa un número de teléfono válido'
  };
};

/**
 * Valida longitud de texto
 * @param {string} text - Texto a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateLength = (text, min, max) => {
  if (!text) {
    return {
      isValid: min === 0,
      error: min > 0 ? 'Este campo es requerido' : null
    };
  }

  const length = text.trim().length;

  if (length < min) {
    return {
      isValid: false,
      error: `Debe tener al menos ${min} caracteres`
    };
  }

  if (max && length > max) {
    return {
      isValid: false,
      error: `No puede exceder ${max} caracteres`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida campo requerido
 * @param {*} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  const isValid = value !== null && value !== undefined && value !== '';

  return {
    isValid,
    error: isValid ? null : `${fieldName} es requerido`
  };
};

/**
 * Valida formato de color hexadecimal
 * @param {string} color - Color a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateHexColor = (color) => {
  if (!color) return { isValid: false, error: 'Color es requerido' };

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const isValid = hexRegex.test(color);

  return {
    isValid,
    error: isValid ? null : 'Por favor ingresa un color hexadecimal válido (ej: #1a1a1a)'
  };
};

/**
 * Valida precio (número positivo)
 * @param {string|number} price - Precio a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validatePrice = (price) => {
  if (!price && price !== 0) {
    return { isValid: false, error: 'El precio es requerido' };
  }

  const numPrice = Number(price);

  if (isNaN(numPrice) || numPrice < 0) {
    return {
      isValid: false,
      error: 'El precio debe ser un número positivo'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Crea un lector de archivo que devuelve una promesa con la URL de datos
 * @param {File} file - Archivo a leer
 * @returns {Promise<string>} URL de datos del archivo
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
};
