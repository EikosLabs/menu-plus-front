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
    this.logToConsole = true;
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
    this._log(LOG_LEVELS.DEBUG, message, context);
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

    if (level === LOG_LEVELS.ERROR) {
      this._sendToRemote(logEntry);
    }
  }

  /**
    * Envía logs a un servicio remoto (implementar según necesidad)
    */
  async _sendToRemote(logEntry) {
    void logEntry;
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

  /**
  * Log específico para análisis de imágenes
  */
  logImageAnalysis(event, data = {}) {
    const logEntry = {
      event,
      component: 'ImageAnalysis',
      timestamp: new Date().toISOString(),
      ...data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log a console
    if (this.logToConsole) {
      console.log(`[ImageAnalysis] ${event}`, data);
    }

    if (['error', 'analysis_failed'].includes(event)) {
      this._sendToRemote({
        ...logEntry,
        level: LOG_LEVELS.ERROR
      });
    }
  }

  /**
  * Obtiene estadísticas de análisis de imágenes
  */
  getImageAnalysisStats() {
    const imageLogs = this.logs.filter(log => log.component === 'ImageAnalysis');

    const stats = {
      total: imageLogs.length,
      successful: imageLogs.filter(log => log.event === 'analysis_completed').length,
      failed: imageLogs.filter(log => log.event === 'analysis_failed').length,
      validationFailed: imageLogs.filter(log => log.event === 'validation_failed').length,
      retried: imageLogs.filter(log => log.event?.includes('retry')).length,
      errorTypes: {},
      averageConfidence: 0,
      recentErrors: []
    };

    // Calcular tipos de error más comunes
    for (const log of imageLogs) {
      if (log.errorType) {
        stats.errorTypes[log.errorType] = (stats.errorTypes[log.errorType] || 0) + 1;
      }

      // Calcular confidence score promedio
      if (log.confidenceScore) {
        stats.averageConfidence += log.confidenceScore;
      }
    }

    // Promedio de confidence
    const successfulAnalyses = imageLogs.filter(log => log.confidenceScore);
    if (successfulAnalyses.length > 0) {
      stats.averageConfidence = stats.averageConfidence / successfulAnalyses.length;
    }

    // Errores recientes (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    stats.recentErrors = imageLogs.filter(log =>
      ['analysis_failed', 'validation_failed', 'error'].includes(log.event) &&
      new Date(log.timestamp) > oneDayAgo
    ).slice(-10); // Últimos 10 errores

    return stats;
  }

  /**
  * Limpia logs antiguos de análisis de imágenes (más de 7 días)
  */
  cleanupOldImageLogs() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    this.logs = this.logs.filter(log =>
      log.component !== 'ImageAnalysis' || new Date(log.timestamp) > sevenDaysAgo
    );
  }
}

// Instancia singleton
export const errorLogger = new ErrorLogger();

// Exportar también para testing
export default errorLogger;
