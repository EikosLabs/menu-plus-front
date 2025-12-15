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
 * Valida tamaño de archivo con feedback mejorado
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  if (!file) return null;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const excessMB = (fileSizeMB - maxSizeMB).toFixed(1);

    return {
      isValid: false,
      message: `El archivo es demasiado grande (${fileSizeMB}MB). Máximo permitido: ${maxSizeMB}MB.`,
      details: {
        currentSize: `${fileSizeMB}MB`,
        maxSize: `${maxSizeMB}MB`,
        excess: `${excessMB}MB`,
        fileSize: file.size,
        maxFileSize: maxSizeBytes
      },
      suggestions: [
        'Usa una imagen más pequeña',
        'Comprime la imagen antes de subirla',
        'Reduce la resolución de la imagen',
        'Usa formato JPEG en lugar de PNG',
        'Recorta la imagen al tamaño necesario'
      ]
    };
  }

  return {
    isValid: true,
    message: `Tamaño de archivo válido: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    details: {
      currentSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      fileSize: file.size
    }
  };
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
 * Validación mejorada para archivos de imagen
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    minWidth = 1,
    minHeight = 1,
    maxWidth = 10000,
    maxHeight = 10000,
    recommendedMinWidth = 800,
    recommendedMinHeight = 600
  } = options;

  if (!file) {
    return {
      isValid: false,
      message: 'Por favor selecciona una imagen',
      type: 'no_file'
    };
  }

  // Validar tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
    return {
      isValid: false,
      message: `Tipo de archivo no válido: ${file.type}`,
      details: {
        fileType: file.type,
        allowedTypes: allowedTypes,
        allowedExtensions
      },
      type: 'invalid_type',
      suggestions: [
        `Usa formatos: ${allowedExtensions}`,
        'Verifica que el archivo sea realmente una imagen'
      ]
    };
  }

  // Validar tamaño
  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.isValid) {
    return {
      ...sizeValidation,
      type: 'file_too_large'
    };
  }

  // Analizar nombre del archivo para sugerencias
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  // Recomendaciones basadas en el tamaño
  let recommendations = [];

  if (file.size > 2 * 1024 * 1024) { // > 2MB
    recommendations.push('Considera comprimir la imagen para tiempos de carga más rápidos');
  }

  if (fileExtension === 'png' && file.size > 1024 * 1024) { // PNG > 1MB
    recommendations.push('Los archivos PNG grandes pueden convertirse a JPEG para reducir tamaño');
  }

  return {
    isValid: true,
    message: `Imagen válida (${fileSizeMB}MB, ${file.type.split('/')[1].toUpperCase()})`,
    details: {
      fileName: file.name,
      fileSize: `${fileSizeMB}MB`,
      fileType: file.type,
      fileExtension
    },
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    type: 'valid'
  };
};

/**
 * Obtiene información detallada del archivo de imagen
 */
export const getImageFileInfo = (file) => {
  if (!file) return null;

  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
  const fileType = file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN';

  // Calcular densidad de píxeles estimada si tenemos dimensiones (requeriría Image API)
  let estimatedDimensions = null;
  let quality = 'good';

  // Estimaciones basadas en el tamaño y tipo
  if (fileExtension === 'png' && file.size > 2 * 1024 * 1024) {
    quality = 'large_png';
  } else if (fileExtension === 'jpg' && file.size < 100 * 1024) {
    quality = 'small_jpg';
  } else if (file.size > 5 * 1024 * 1024) {
    quality = 'very_large';
  }

  return {
    name: file.name,
    size: file.size,
    sizeMB: parseFloat(fileSizeMB),
    sizeFormatted: `${fileSizeMB}MB`,
    type: file.type,
    extension: fileExtension,
    typeFormatted: fileType,
    lastModified: new Date(file.lastModified).toISOString(),
    quality,
    recommendations: getFileRecommendations(file, fileExtension, fileSizeMB)
  };
};

/**
 * Genera recomendaciones para optimizar imágenes
 */
function getFileRecommendations(file, extension, sizeMB) {
  const recommendations = [];

  // Recomendaciones basadas en el tamaño
  const sizeNum = parseFloat(sizeMB);
  if (sizeNum > 5) {
    recommendations.push('La imagen es muy grande. Considera reducirla a menos de 2MB para mejor rendimiento.');
  } else if (sizeNum > 2) {
    recommendations.push('La imagen es grande. La compresión automática ayudará a optimizarla.');
  }

  // Recomendaciones basadas en el formato
  if (extension === 'png' && sizeNum > 1) {
    recommendations.push('PNGs grandes pueden convertirse a JPEG para reducir significativamente el tamaño.');
  }

  if (extension === 'gif' && !file.name.toLowerCase().includes('animado')) {
    recommendations.push('Los GIFs estáticos pueden ser más eficientes como PNG o JPEG.');
  }

  // Recomendaciones generales
  if (!file.name.toLowerCase().includes('min') && !file.name.toLowerCase().includes('opt')) {
    recommendations.push('Considera optimizar la imagen antes de subirla para mejores resultados.');
  }

  return recommendations;
}

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
