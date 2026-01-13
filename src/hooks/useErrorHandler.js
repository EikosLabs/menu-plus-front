import { useState, useCallback } from 'react';
import { AppError, parseValidationErrors } from '../utils/AppError';
import { ERROR_TYPES, requiresReAuth, isRetryableError } from '../utils/errorTypes';
import { useSentryError } from './useSentryError';
import { localizeUrl } from '../i18n/utils';

/**
 * Hook para manejo centralizado de errores
 * Proporciona estado y funciones para gestionar errores de forma consistente
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isRetryable, setIsRetryable] = useState(false);
  const { captureException, captureMessage, addBreadcrumb } = useSentryError();

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

    // Enviar error a Sentry (solo para errores que no son de validación)
    if (appError.type !== ERROR_TYPES.VALIDATION_ERROR && appError.type !== ERROR_TYPES.BUSINESS_ERROR) {
      captureException(appError, {
        ...context,
        errorType: appError.type,
        errorCode: appError.code,
        userMessage: appError.message,
      });
    } else {
      // Para errores de validación o de negocio, solo enviar como mensaje de info
      captureMessage(appError.message, 'info', {
        ...context,
        errorType: appError.type,
        errorCode: appError.code,
      });
    }

    // Agregar breadcrumb para seguimiento
    addBreadcrumb({
      message: `Error handled: ${appError.type}`,
      category: 'error',
      level: 'error',
      data: {
        errorType: appError.type,
        errorCode: appError.code,
        context,
      },
    });

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
      addBreadcrumb({
        message: 'Redirecting to login due to auth error',
        category: 'auth',
        level: 'info',
      });
      setTimeout(() => {
        window.location.href = localizeUrl('/login');
      }, 2000);
    }

    return appError;
  }, [captureException, captureMessage, addBreadcrumb]);

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
