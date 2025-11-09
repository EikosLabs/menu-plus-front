import React from 'react';
import { ERROR_TYPES } from '../../utils/errorTypes';
import { AppError } from '../../utils/AppError';

/**
 * Componente para mostrar alertas de error con diferentes estilos
 * Soporta AppError y strings simples
 */
export default function ErrorAlert({ error, onClose, onRetry, className = '' }) {
  if (!error) return null;

  // Extraer información del error
  const isAppError = error instanceof AppError;
  const errorType = isAppError ? error.type : ERROR_TYPES.UNKNOWN_ERROR;
  const message = typeof error === 'string' ? error : error.message;
  const canRetry = onRetry && isAppError && error.details?.retryable;

  // Determinar icono según tipo de error
  const getIcon = () => {
    switch (errorType) {
      case ERROR_TYPES.NETWORK_ERROR:
      case ERROR_TYPES.TIMEOUT_ERROR:
      case ERROR_TYPES.NO_INTERNET:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        );
      case ERROR_TYPES.UNAUTHORIZED:
      case ERROR_TYPES.FORBIDDEN:
      case ERROR_TYPES.PERMISSION_DENIED:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        );
      case ERROR_TYPES.VALIDATION_ERROR:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  // Título según tipo de error
  const getTitle = () => {
    switch (errorType) {
      case ERROR_TYPES.NETWORK_ERROR:
      case ERROR_TYPES.NO_INTERNET:
        return 'Error de Conexión';
      case ERROR_TYPES.TIMEOUT_ERROR:
        return 'Tiempo de Espera Agotado';
      case ERROR_TYPES.UNAUTHORIZED:
      case ERROR_TYPES.FORBIDDEN:
        return 'Acceso Denegado';
      case ERROR_TYPES.VALIDATION_ERROR:
        return 'Error de Validación';
      case ERROR_TYPES.SERVER_ERROR:
        return 'Error del Servidor';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`neo-alert neo-alert-error flex items-start gap-3 ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="neo-text neo-text-bold mb-1">
          {getTitle()}
        </h3>
        <p className="neo-text text-sm">
          {message}
        </p>

        {/* Retry button */}
        {canRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-sm neo-text neo-text-bold text-neo-flame hover:underline"
          >
            Reintentar
          </button>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Cerrar alerta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Componente para mostrar alerta de éxito
 */
export function SuccessAlert({ message, onClose, className = '' }) {
  if (!message) return null;

  return (
    <div className={`neo-alert neo-alert-success flex items-start gap-3 ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="flex-1 neo-text">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
          aria-label="Cerrar alerta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Componente para mostrar errores de campo inline
 */
export function FieldError({ error, className = '' }) {
  if (!error) return null;

  return (
    <p className={`text-sm text-red-600 mt-1 flex items-center gap-1 ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{error}</span>
    </p>
  );
}
