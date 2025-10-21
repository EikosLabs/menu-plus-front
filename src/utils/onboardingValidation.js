/**
 * Utilidades de validación para el formulario de onboarding
 */

/**
 * Valida formato de email
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: true, error: null }; // Email es opcional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: isValid ? null : 'Por favor ingresa un email válido'
  };
};

/**
 * Valida formato de URL
 */
export const validateUrl = (url) => {
  if (!url) return { isValid: true, error: null }; // URL es opcional
  
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
 * Acepta formatos internacionales básicos
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, error: null }; // Teléfono es opcional
  
  // Permitir números con o sin código de país, espacios, guiones y paréntesis
  const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
  const isValid = phoneRegex.test(phone);
  
  return {
    isValid,
    error: isValid ? null : 'Por favor ingresa un número de teléfono válido'
  };
};

/**
 * Valida archivo de imagen
 */
export const validateImageFile = (file) => {
  if (!file) return { isValid: true, error: null }; // Imagen es opcional
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 1024 * 1024; // 1MB
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de archivo no válido (solo JPEG, PNG, GIF, WebP)'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande (máximo 1MB)'
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valida longitud de texto
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
