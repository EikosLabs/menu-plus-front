/**
 * Utilidades de validación para formularios
 */

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'El email es requerido';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Por favor ingresa un email válido';
  }

  return null;
};

/**
 * Valida contraseña con requisitos de seguridad
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  if (!password) {
    return 'La contraseña es requerida';
  }

  if (password.length < minLength) {
    return `La contraseña debe tener al menos ${minLength} caracteres`;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una minúscula';
  }

  if (requireNumber && !/\d/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }

  if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'La contraseña debe contener al menos un carácter especial';
  }

  return null;
};

/**
 * Valida que un campo no esté vacío
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} es requerido`;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} es requerido`;
  }

  return null;
};

/**
 * Valida longitud mínima
 */
export const validateMinLength = (value, minLength, fieldName = 'Este campo') => {
  if (!value) return null; // Si es null/undefined, usar validateRequired

  if (value.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }

  return null;
};

/**
 * Valida longitud máxima
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Este campo') => {
  if (!value) return null;

  if (value.length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`;
  }

  return null;
};

/**
 * Valida rango numérico
 */
export const validateNumberRange = (value, min, max, fieldName = 'Este valor') => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }

  if (min !== undefined && num < min) {
    return `${fieldName} debe ser al menos ${min}`;
  }

  if (max !== undefined && num > max) {
    return `${fieldName} no puede ser mayor a ${max}`;
  }

  return null;
};

/**
 * Valida precio (número positivo con máximo 2 decimales)
 */
export const validatePrice = (value, fieldName = 'El precio') => {
  if (!value && value !== 0) {
    return `${fieldName} es requerido`;
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }

  if (num < 0) {
    return `${fieldName} no puede ser negativo`;
  }

  // Verificar máximo 2 decimales
  const decimals = (value.toString().split('.')[1] || '').length;
  if (decimals > 2) {
    return `${fieldName} no puede tener más de 2 decimales`;
  }

  return null;
};

/**
 * Valida URL
 */
export const validateUrl = (url, fieldName = 'La URL') => {
  if (!url) return null; // Opcional

  try {
    new URL(url);
    return null;
  } catch {
    return `${fieldName} no es válida`;
  }
};

/**
 * Valida teléfono (formato simple)
 */
export const validatePhone = (phone, fieldName = 'El teléfono') => {
  if (!phone) return null; // Opcional

  // Permitir números, espacios, guiones, paréntesis, y +
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;

  if (!phoneRegex.test(phone)) {
    return `${fieldName} contiene caracteres no válidos`;
  }

  // Verificar que tenga al menos 7 dígitos
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) {
    return `${fieldName} debe tener al menos 7 dígitos`;
  }

  return null;
};

/**
 * Valida tipo de archivo
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']) => {
  if (!file) return 'Por favor selecciona un archivo';

  if (!allowedTypes.includes(file.type)) {
    const extensions = allowedTypes.map(type => type.split('/')[1]).join(', ');
    return `Solo se permiten archivos: ${extensions}`;
  }

  return null;
};

/**
 * Valida tamaño de archivo
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) return null;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB`;
  }

  return null;
};

/**
 * Valida múltiples reglas para un campo
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) {
      return error; // Retornar el primer error encontrado
    }
  }
  return null;
};

/**
 * Valida un objeto completo con reglas por campo
 */
export const validateForm = (data, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = data[fieldName];
    const error = validateField(value, rules);

    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
