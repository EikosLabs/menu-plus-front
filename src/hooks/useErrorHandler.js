import { useState, useCallback } from 'react';
import { AppError, parseValidationErrors } from '../utils/AppError';
import { ERROR_TYPES, requiresReAuth, isRetryableError } from '../utils/errorTypes';
import { localizeUrl } from '../i18n/utils';

/**
 * Hook para manejo centralizado de errores
 * Proporciona estado y funciones para gestionar errores de forma consistente
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isRetryable, setIsRetryable] = useState(false);

  /**
   * Maneja un error y lo convierte a AppError
   */
  const handleError = useCallback((err, context = {}) => {
    let appError;

    // Convertir a AppError si no lo es
    if (err instanceof AppError) {
      appError = err;
    } else {
      appError = AppError.fromError(err, context);
    }

    // Configurar estado
    setError(appError);
    setIsRetryable(isRetryableError(appError.type));

    // Manejar errores de validación
    if (appError.type === ERROR_TYPES.VALIDATION_ERROR && appError.details.fieldErrors) {
      setFieldErrors(appError.details.fieldErrors);
    } else if (appError.details.serverData) {
      const parsedErrors = parseValidationErrors(appError.details.serverData);
      if (Object.keys(parsedErrors).length > 0) {
        setFieldErrors(parsedErrors);
      }
    }

    // Redirigir a login si es necesario
    if (requiresReAuth(appError.type)) {
      setTimeout(() => {
        window.location.href = localizeUrl('/login');
      }, 2000);
    }

    return appError;
  }, []);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setIsRetryable(false);
  }, []);

  /**
   * Limpia un error de campo específico
   */
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Wrapper para ejecutar funciones async con manejo de errores
   */
  const executeWithErrorHandling = useCallback(async (asyncFn, context = {}) => {
    clearError();
    try {
      return await asyncFn();
    } catch (err) {
      handleError(err, context);
      throw err; // Re-throw para que el caller pueda manejar si es necesario
    }
  }, [handleError, clearError]);

  return {
    error,
    fieldErrors,
    isRetryable,
    hasError: error !== null,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
    handleError,
    clearError,
    clearFieldError,
    executeWithErrorHandling,
  };
};

/**
 * Hook simplificado para un solo campo de error
 */
export const useFieldError = (fieldName) => {
  const [error, setError] = useState(null);

  const setFieldError = useCallback((message) => {
    setError(message);
  }, []);

  const clearFieldError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    setFieldError,
    clearFieldError,
  };
};
