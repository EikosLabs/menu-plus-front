import { ERROR_TYPES, ERROR_MESSAGES, mapHttpStatusToErrorType } from './errorTypes';

/**
 * Clase de error personalizada para la aplicación
 * Proporciona información estructurada sobre errores
 */
export class AppError extends Error {
  constructor(type, message, details = {}) {
    super(message || ERROR_MESSAGES[type] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR]);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convierte el error a objeto plano para logging
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Crea un AppError desde una respuesta HTTP
   */
  static async fromResponse(response, customMessage = null) {
    const errorType = mapHttpStatusToErrorType(response.status);
    let details = {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    };

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        details = { ...details, serverData: data };

        // Intentar extraer mensaje específico del servidor
        const serverMessage = data.message || data.error || data.title;
        if (serverMessage) {
          return new AppError(errorType, customMessage || serverMessage, details);
        }
      } else {
        const text = await response.text();
        details.serverMessage = text;
      }
    } catch (parseError) {
      details.parseError = parseError.message;
    }

    return new AppError(errorType, customMessage, details);
  }

  /**
   * Crea un AppError desde un error de red
   */
  static fromNetworkError(error, context = {}) {
    let errorType = ERROR_TYPES.NETWORK_ERROR;
    let details = { originalError: error.message, context };

    // Detectar tipo específico de error de red
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      errorType = ERROR_TYPES.TIMEOUT_ERROR;
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      errorType = ERROR_TYPES.NO_INTERNET;
    } else if (error.message?.includes('refused')) {
      errorType = ERROR_TYPES.CONNECTION_REFUSED;
    }

    return new AppError(errorType, null, details);
  }

  /**
   * Crea un AppError de validación con errores de campos
   */
  static validationError(fieldErrors, message = null) {
    return new AppError(
      ERROR_TYPES.VALIDATION_ERROR,
      message,
      { fieldErrors }
    );
  }

  /**
   * Crea un AppError desde cualquier error
   */
  static fromError(error, context = {}) {
    // Si ya es un AppError, retornarlo
    if (error instanceof AppError) {
      return error;
    }

    // Si es un error con tipo conocido
    if (error.type && ERROR_TYPES[error.type]) {
      return new AppError(error.type, error.message, { ...context, originalError: error });
    }

    // Error genérico
    return new AppError(
      ERROR_TYPES.UNKNOWN_ERROR,
      error.message,
      { ...context, originalError: error.toString() }
    );
  }
}

/**
 * Helper para parsear errores de validación del servidor
 */
export const parseValidationErrors = (serverData) => {
  const fieldErrors = {};

  // ASP.NET Core ValidationProblemDetails format
  if (serverData.errors && typeof serverData.errors === 'object') {
    Object.keys(serverData.errors).forEach(field => {
      const messages = serverData.errors[field];
      fieldErrors[field.toLowerCase()] = Array.isArray(messages) ? messages[0] : messages;
    });
  }

  // Generic errors array
  if (Array.isArray(serverData.errors)) {
    serverData.errors.forEach((error, index) => {
      const field = error.field || error.propertyName || `field${index}`;
      fieldErrors[field.toLowerCase()] = error.message || error.errorMessage;
    });
  }

  return fieldErrors;
};
