import { AppError } from './AppError';

/**
 * Sistema de logging de errores
 * En producción, esto puede enviar logs a un servicio externo
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class ErrorLogger {
  constructor() {
    this.enabled = true;
    this.logToConsole = import.meta.env.DEV; // Solo en desarrollo
    this.logs = []; // Almacenar logs localmente
    this.maxLogs = 50; // Máximo de logs en memoria
  }

  /**
   * Log de error
   */
  error(error, context = {}) {
    this._log(LOG_LEVELS.ERROR, error, context);
  }

  /**
   * Log de advertencia
   */
  warn(message, context = {}) {
    this._log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * Log de información
   */
  info(message, context = {}) {
    this._log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * Log de debug
   */
  debug(message, context = {}) {
    if (import.meta.env.DEV) {
      this._log(LOG_LEVELS.DEBUG, message, context);
    }
  }

  /**
   * Método interno para logging
   */
  _log(level, messageOrError, context) {
    if (!this.enabled) return;

    const logEntry = {
      level,
      timestamp: new Date().toISOString(),
      context,
    };

    // Si es un AppError, extraer toda la información
    if (messageOrError instanceof AppError) {
      logEntry.error = messageOrError.toJSON();
      logEntry.message = messageOrError.message;
      logEntry.errorType = messageOrError.type;
    } else if (messageOrError instanceof Error) {
      logEntry.error = {
        name: messageOrError.name,
        message: messageOrError.message,
        stack: messageOrError.stack,
      };
      logEntry.message = messageOrError.message;
    } else {
      logEntry.message = messageOrError;
    }

    // Agregar información del navegador
    logEntry.userAgent = navigator.userAgent;
    logEntry.url = window.location.href;

    // Guardar en memoria
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Eliminar el más antiguo
    }

    // Log a console en desarrollo
    if (this.logToConsole) {
      const consoleMethod = level === LOG_LEVELS.ERROR ? console.error :
                           level === LOG_LEVELS.WARN ? console.warn :
                           console.log;

      consoleMethod(`[${level.toUpperCase()}]`, logEntry.message, {
        ...context,
        ...(logEntry.error || {}),
      });
    }

    // En producción, enviar a servicio de logging
    if (import.meta.env.PROD && level === LOG_LEVELS.ERROR) {
      this._sendToRemote(logEntry);
    }
  }

  /**
   * Envía logs a un servicio remoto (implementar según necesidad)
   */
  async _sendToRemote(logEntry) {
    // TODO: Implementar envío a servicio de logging (ej: Sentry, LogRocket, etc.)
    // Por ahora solo almacenamos localmente
    try {
      // Ejemplo de implementación:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // });
    } catch (error) {
      // Falló el envío, solo log local
      if (this.logToConsole) {
        console.warn('Failed to send log to remote:', error);
      }
    }
  }

  /**
   * Obtiene todos los logs almacenados
   */
  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  /**
   * Limpia los logs almacenados
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Exporta logs como JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Descarga logs como archivo
   */
  downloadLogs() {
    const logsJson = this.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Habilita/deshabilita logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Instancia singleton
export const errorLogger = new ErrorLogger();

// Exportar también para testing
export default errorLogger;
