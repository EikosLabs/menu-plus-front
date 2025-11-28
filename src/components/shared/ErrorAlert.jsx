import React, { useEffect, useState } from 'react';
import { ERROR_TYPES } from '../../utils/errorTypes';
import { AppError } from '../../utils/AppError';

/**
 * Componente para mostrar alertas de error con diferentes estilos
 * Soporta AppError y strings simples
 */
export default function ErrorAlert({ error, onClose, onRetry, className = '' }) {
  const [isShaking, setIsShaking] = useState(true);

  useEffect(() => {
    // Re-trigger animation on error change
    setIsShaking(true);
    const timer = setTimeout(() => setIsShaking(false), 500);
    return () => clearTimeout(timer);
  }, [error]);

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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        );
      case ERROR_TYPES.UNAUTHORIZED:
      case ERROR_TYPES.FORBIDDEN:
      case ERROR_TYPES.PERMISSION_DENIED:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case ERROR_TYPES.VALIDATION_ERROR:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        return 'Ha ocurrido un error';
    }
  };

  return (
    <div className={`neo-alert neo-alert-error flex items-start gap-4 shadow-lg animate-neo-slide-down ${isShaking ? 'animate-neo-shake' : ''} ${className}`}>
      {/* Icon Box */}
      <div className="flex-shrink-0 bg-white/20 p-2 rounded-full text-white">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="font-bold text-lg mb-1 leading-tight">
          {getTitle()}
        </h3>
        <p className="text-sm opacity-90 leading-relaxed">
          {message}
        </p>

        {/* Retry button */}
        {canRetry && (
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-1.5 text-xs font-bold uppercase bg-white text-red-600 border-2 border-red-800 rounded hover:bg-red-50 transition-colors shadow-sm"
          >
            Reintentar
          </button>
        )}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 -mr-2 -mt-2 p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Cerrar alerta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Componente para mostrar alerta de éxito
 */
export function SuccessAlert({ message, onClose, className = '', autoDismiss = false, dismissTime = 5000 }) {
  useEffect(() => {
    if (autoDismiss && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, dismissTime);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onClose, dismissTime]);

  if (!message) return null;

  return (
    <div className={`neo-alert neo-alert-success flex items-start gap-4 shadow-lg animate-neo-pop-in ${className}`}>
      <div className="flex-shrink-0 bg-green-100 p-2 rounded-full border-2 border-green-600 text-green-700">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1 pt-1.5">
        <h3 className="font-bold text-lg mb-1 leading-tight text-neo-black">¡Éxito!</h3>
        <p className="text-neo-text">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 -mr-2 -mt-2 p-2 text-green-800 hover:text-green-900 transition-colors"
          aria-label="Cerrar alerta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
    <div className={`text-sm text-red-600 mt-1.5 font-medium flex items-center gap-1.5 animate-neo-slide-down ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  );
}
