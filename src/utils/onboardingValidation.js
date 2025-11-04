/**
 * Utilidades de validación para el formulario de onboarding
 * Usa validadores consolidados de utils/validators.js
 */

import {
  validateEmail,
  validateUrl,
  validatePhone,
  validateImageFile,
  validateLength,
  validateRequired,
  validateHexColor
} from './validators.js';

// Re-exportar validadores para mantener compatibilidad
export {
  validateEmail,
  validateUrl,
  validatePhone,
  validateImageFile,
  validateLength,
  validateRequired,
  validateHexColor
};

/**
 * Valida el paso 1: Información Básica
 */
export const validateStepBasicInfo = (formData) => {
  const errors = {};
  
  // Nombre del negocio (requerido)
  const nameValidation = validateLength(formData.name, 2, 100);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }
  
  // Descripción (opcional, pero con límite)
  if (formData.description) {
    const descValidation = validateLength(formData.description, 0, 500);
    if (!descValidation.isValid) {
      errors.description = descValidation.error;
    }
  }
  
  // Categoría (requerida)
  const categoryValidation = validateRequired(formData.businessCategoryId, 'La categoría');
  if (!categoryValidation.isValid) {
    errors.businessCategoryId = categoryValidation.error;
  }
  
  return errors;
};

/**
 * Valida el paso 2: Logo
 */
export const validateStepLogo = (formData) => {
  const errors = {};
  
  // Logo es opcional, pero si existe debe ser válido
  if (formData.logoFile) {
    const fileValidation = validateImageFile(formData.logoFile);
    if (!fileValidation.isValid) {
      errors.logoFile = fileValidation.error;
    }
  }
  
  return errors;
};

/**
 * Valida el paso 3: Información de Contacto
 */
export const validateStepContact = (formData) => {
  const errors = {};
  
  // Email (opcional)
  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
  }
  
  // Teléfono (opcional)
  if (formData.phoneNumber) {
    const phoneValidation = validatePhone(formData.phoneNumber);
    if (!phoneValidation.isValid) {
      errors.phoneNumber = phoneValidation.error;
    }
  }
  
  return errors;
};

/**
 * Valida el paso 4: Redes Sociales
 */
export const validateStepSocial = (formData) => {
  const errors = {};
  
  // Todas las URLs son opcionales
  if (formData.facebookUrl) {
    const fbValidation = validateUrl(formData.facebookUrl);
    if (!fbValidation.isValid) {
      errors.facebookUrl = fbValidation.error;
    }
  }
  
  if (formData.instagramUrl) {
    const igValidation = validateUrl(formData.instagramUrl);
    if (!igValidation.isValid) {
      errors.instagramUrl = igValidation.error;
    }
  }
  
  if (formData.twitterUrl) {
    const twValidation = validateUrl(formData.twitterUrl);
    if (!twValidation.isValid) {
      errors.twitterUrl = twValidation.error;
    }
  }
  
  // WhatsApp puede ser un número o URL
  if (formData.whatsAppNumber) {
    const waValidation = validatePhone(formData.whatsAppNumber);
    if (!waValidation.isValid) {
      errors.whatsAppNumber = waValidation.error;
    }
  }
  
  return errors;
};

/**
 * Valida el paso 5: Colores
 */
export const validateStepColors = (formData) => {
  const errors = {};
  
  // Todos los colores son requeridos
  const primaryValidation = validateHexColor(formData.primaryColor);
  if (!primaryValidation.isValid) {
    errors.primaryColor = primaryValidation.error;
  }
  
  const secondaryValidation = validateHexColor(formData.secondaryColor);
  if (!secondaryValidation.isValid) {
    errors.secondaryColor = secondaryValidation.error;
  }
  
  const accentValidation = validateHexColor(formData.accentColor);
  if (!accentValidation.isValid) {
    errors.accentColor = accentValidation.error;
  }
  
  return errors;
};

/**
 * Valida un paso específico según su número
 */
export const validateStep = (stepNumber, formData) => {
  switch (stepNumber) {
    case 1:
      return validateStepBasicInfo(formData);
    case 2:
      return validateStepLogo(formData);
    case 3:
      return validateStepContact(formData);
    case 4:
      return validateStepSocial(formData);
    case 5:
      return validateStepColors(formData);
    default:
      return {};
  }
};
