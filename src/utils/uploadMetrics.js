/**
 * Upload Metrics and Tracking Utility
 * Provides comprehensive tracking for image upload operations
 * including performance, compression, and error metrics
 */

/**
 * @typedef {Object} UploadMetrics
 * @property {string} fileName - Name of the uploaded file
 * @property {number} fileSize - Size in bytes
 * @property {string} fileType - MIME type
 * @property {string} fileExtension - File extension
 * @property {number} uploadStartTime - Upload start timestamp
 * @property {number} uploadEndTime - Upload end timestamp
 * @property {number} uploadDuration - Upload duration in milliseconds
 * @property {boolean} compressionEnabled - Whether compression was enabled
 * @property {number} [originalSize] - Original file size before compression
 * @property {number} [compressedSize] - Compressed file size
 * @property {number} [compressionRatio] - Compression percentage
 * @property {number} [compressionTime] - Compression time in milliseconds
 * @property {boolean} [compressionSuccessful] - Whether compression was successful
 * @property {number} [uploadSpeed] - Upload speed in KB/s
 * @property {number} retryCount - Number of retries
 * @property {boolean} success - Whether upload was successful
 * @property {string} [errorType] - Type of error if failed
 * @property {string} [errorMessage] - Error message if failed
 * @property {number} [httpStatus] - HTTP status code
 * @property {string} userAgent - User agent string
 * @property {string} timestamp - ISO timestamp
 * @property {string} sessionId - Upload session ID
 */

/**
 * @typedef {Object} UploadSession
 * @property {string} sessionId - Session identifier
 * @property {number} startTime - Session start timestamp
 * @property {UploadMetrics[]} uploads - Array of upload metrics
 * @property {number} totalUploads - Total upload attempts
 * @property {number} successfulUploads - Number of successful uploads
 * @property {number} failedUploads - Number of failed uploads
 * @property {number} averageUploadTime - Average upload time in milliseconds
 * @property {number} totalDataUploaded - Total data uploaded in bytes
 * @property {number} compressionSavings - Total compression savings in bytes
 */

class UploadMetricsTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.session = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      uploads: [],
      totalUploads: 0,
      successfulUploads: 0,
      failedUploads: 0,
      averageUploadTime: 0,
      totalDataUploaded: 0,
      compressionSavings: 0
    };
  }

  /**
   * Generates a unique session ID for tracking uploads
   */
  generateSessionId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Starts tracking an upload operation
   */
  startUpload(file, options = {}) {
    return {
      file,
      startTime: performance.now(),
      options: {
        compressionEnabled: options.compressionEnabled ?? true,
        retryCount: 0,
        ...options
      }
    };
  }

  /**
   * Records a successful upload
   */
  recordUploadSuccess(uploadData, result, uploadStartTime) {
    const endTime = performance.now();
    const duration = endTime - uploadStartTime;

    const metrics = {
      // File information
      fileName: uploadData.file.name,
      fileSize: uploadData.file.size,
      fileType: uploadData.file.type,
      fileExtension: this.getFileExtension(uploadData.file.name),

      // Upload timing
      uploadStartTime: uploadStartTime,
      uploadEndTime: endTime,
      uploadDuration: duration,

      // Compression metrics
      compressionEnabled: uploadData.options.compressionEnabled,
      compressionSuccessful: uploadData.compressionResult?.success ?? false,
      originalSize: uploadData.compressionResult?.originalSize,
      compressedSize: uploadData.compressionResult?.compressedSize,
      compressionRatio: uploadData.compressionResult?.compressionRatio,
      compressionTime: uploadData.compressionResult?.processingTime,

      // Network performance
      uploadSpeed: this.calculateUploadSpeed(uploadData.file.size, duration),
      retryCount: uploadData.options.retryCount || 0,

      // Result
      success: true,
      httpStatus: result.status || 200,

      // Additional context
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.addMetricsToSession(metrics);
    this.logSuccessMetrics(metrics);

    return metrics;
  }

  /**
   * Records a failed upload
   */
  recordUploadFailure(uploadData, error, uploadStartTime) {
    const endTime = performance.now();
    const duration = endTime - uploadStartTime;

    const metrics = {
      // File information
      fileName: uploadData.file.name,
      fileSize: uploadData.file.size,
      fileType: uploadData.file.type,
      fileExtension: this.getFileExtension(uploadData.file.name),

      // Upload timing
      uploadStartTime: uploadStartTime,
      uploadEndTime: endTime,
      uploadDuration: duration,

      // Compression metrics
      compressionEnabled: uploadData.options.compressionEnabled,
      compressionSuccessful: uploadData.compressionResult?.success ?? false,
      originalSize: uploadData.compressionResult?.originalSize,
      compressedSize: uploadData.compressionResult?.compressedSize,
      compressionRatio: uploadData.compressionResult?.compressionRatio,
      compressionTime: uploadData.compressionResult?.processingTime,

      // Network performance
      retryCount: uploadData.options.retryCount || 0,

      // Result
      success: false,
      errorType: error.type || 'UNKNOWN_ERROR',
      errorMessage: error.message,
      httpStatus: error.status,

      // Additional context
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId
    };

    this.addMetricsToSession(metrics);
    this.logFailureMetrics(metrics);

    return metrics;
  }

  /**
   * Adds metrics to the current session
   */
  addMetricsToSession(metrics) {
    this.session.uploads.push(metrics);
    this.session.totalUploads++;

    if (metrics.success) {
      this.session.successfulUploads++;
      this.session.totalDataUploaded += metrics.fileSize;

      if (metrics.compressionSuccessful && metrics.originalSize && metrics.compressedSize) {
        this.session.compressionSavings += (metrics.originalSize - metrics.compressedSize);
      }
    } else {
      this.session.failedUploads++;
    }

    // Update average upload time
    const totalUploadTime = this.session.uploads.reduce((sum, upload) => sum + upload.uploadDuration, 0);
    this.session.averageUploadTime = totalUploadTime / this.session.totalUploads;
  }

  /**
   * Logs success metrics to console and error tracking
   */
  logSuccessMetrics(metrics) {
    const logData = {
      event: 'upload_success',
      fileName: metrics.fileName,
      fileSize: this.formatFileSize(metrics.fileSize),
      duration: `${metrics.uploadDuration.toFixed(0)}ms`,
      uploadSpeed: `${metrics.uploadSpeed?.toFixed(1)} KB/s`,
      compression: metrics.compressionSuccessful
        ? `${metrics.compressionRatio?.toFixed(1)}% saved in ${metrics.compressionTime?.toFixed(0)}ms`
        : 'Not applied',
      retryCount: metrics.retryCount
    };

    console.log('[UploadMetrics] ✅ Upload successful:', logData);
  }

  /**
   * Logs failure metrics to console and error tracking
   */
  logFailureMetrics(metrics) {
    const logData = {
      event: 'upload_failure',
      fileName: metrics.fileName,
      fileSize: this.formatFileSize(metrics.fileSize),
      duration: `${metrics.uploadDuration.toFixed(0)}ms`,
      errorType: metrics.errorType,
      errorMessage: metrics.errorMessage,
      httpStatus: metrics.httpStatus,
      retryCount: metrics.retryCount,
      compression: metrics.compressionSuccessful
        ? `${metrics.compressionRatio?.toFixed(1)}% saved`
        : 'Not applied'
    };

    console.error('[UploadMetrics] ❌ Upload failed:', logData);
  }

  /**
   * Calculates upload speed in KB/s
   */
  calculateUploadSpeed(fileSize: number, duration: number): number {
    if (duration <= 0) return 0;
    return (fileSize / (duration / 1000)) / 1024; // KB/s
  }

  /**
   * Gets file extension from filename
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'unknown';
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Gets current session statistics
   */
  getSessionStats(): UploadSession {
    return { ...this.session };
  }

  /**
   * Gets success rate for the current session
   */
  getSuccessRate(): number {
    if (this.session.totalUploads === 0) return 0;
    return (this.session.successfulUploads / this.session.totalUploads) * 100;
  }

  /**
   * Gets average compression ratio for successful uploads
   */
  getAverageCompressionRatio(): number {
    const compressedUploads = this.session.uploads.filter(u =>
      u.success && u.compressionSuccessful && u.compressionRatio !== undefined
    );

    if (compressedUploads.length === 0) return 0;

    const totalRatio = compressedUploads.reduce((sum, upload) => sum + (upload.compressionRatio || 0), 0);
    return totalRatio / compressedUploads.length;
  }

  /**
   * Gets upload performance statistics
   */
  getPerformanceStats() {
    const uploadTimes = this.session.uploads.map(u => u.uploadDuration).sort((a, b) => a - b);
    const uploadSpeeds = this.session.uploads
      .filter(u => u.uploadSpeed !== undefined)
      .map(u => u.uploadSpeed!)
      .sort((a, b) => a - b);

    return {
      // Upload time statistics
      averageUploadTime: this.session.averageUploadTime,
      medianUploadTime: uploadTimes.length > 0 ? uploadTimes[Math.floor(uploadTimes.length / 2)] : 0,
      fastestUpload: uploadTimes.length > 0 ? uploadTimes[0] : 0,
      slowestUpload: uploadTimes.length > 0 ? uploadTimes[uploadTimes.length - 1] : 0,

      // Upload speed statistics
      averageUploadSpeed: uploadSpeeds.length > 0
        ? uploadSpeeds.reduce((sum, speed) => sum + speed, 0) / uploadSpeeds.length
        : 0,
      medianUploadSpeed: uploadSpeeds.length > 0 ? uploadSpeeds[Math.floor(uploadSpeeds.length / 2)] : 0,

      // Overall statistics
      totalUploads: this.session.totalUploads,
      successRate: this.getSuccessRate(),
      compressionSavings: this.formatFileSize(this.session.compressionSavings),
      averageCompressionRatio: this.getAverageCompressionRatio()
    };
  }

  /**
   * Exports session data for analysis
   */
  exportSessionData() {
    return {
      session: this.getSessionStats(),
      performance: this.getPerformanceStats(),
      uploads: this.session.uploads.map(upload => ({
        ...upload,
        fileSize: this.formatFileSize(upload.fileSize),
        uploadSpeed: upload.uploadSpeed ? `${upload.uploadSpeed.toFixed(1)} KB/s` : null,
        uploadDuration: `${upload.uploadDuration.toFixed(0)}ms`
      }))
    };
  }

  /**
   * Resets the current session
   */
  resetSession() {
    this.sessionId = this.generateSessionId();
    this.session = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      uploads: [],
      totalUploads: 0,
      successfulUploads: 0,
      failedUploads: 0,
      averageUploadTime: 0,
      totalDataUploaded: 0,
      compressionSavings: 0
    };
  }

  /**
   * Analyzes upload patterns and provides recommendations
   */
  analyzePatterns() {
    const stats = this.getPerformanceStats();
    const recommendations = [];

    // Success rate recommendations
    if (stats.successRate < 90) {
      recommendations.push({
        type: 'success_rate',
        severity: 'warning',
        message: `Success rate is ${stats.successRate.toFixed(1)}%. Consider reviewing error patterns.`,
        suggestion: 'Analyze failed uploads to identify common issues'
      });
    }

    // Upload speed recommendations
    if (stats.averageUploadSpeed < 100) { // Less than 100 KB/s
      recommendations.push({
        type: 'upload_speed',
        severity: 'warning',
        message: `Average upload speed is ${stats.averageUploadSpeed.toFixed(1)} KB/s, which is quite slow.`,
        suggestion: 'Consider implementing compression or optimizing network conditions'
      });
    }

    // Compression recommendations
    if (stats.averageCompressionRatio < 30) {
      recommendations.push({
        type: 'compression',
        severity: 'info',
        message: `Average compression ratio is ${stats.averageCompressionRatio.toFixed(1)}%.`,
        suggestion: 'Consider adjusting compression settings for better results'
      });
    }

    // Upload time recommendations
    if (stats.slowestUpload > 30000) { // More than 30 seconds
      recommendations.push({
        type: 'upload_time',
        severity: 'error',
        message: `Slowest upload took ${(stats.slowestUpload / 1000).toFixed(1)}s.`,
        suggestion: 'Implement better timeout handling and user feedback'
      });
    }

    return recommendations;
  }
}

// Create singleton instance
const uploadMetrics = new UploadMetricsTracker();

export default uploadMetrics;

// Utility functions for common operations
export const trackUploadStart = (file, options = {}) => {
  return uploadMetrics.startUpload(file, options);
};

export const trackUploadSuccess = (uploadData, result, startTime) => {
  return uploadMetrics.recordUploadSuccess(uploadData, result, startTime);
};

export const trackUploadFailure = (uploadData, error, startTime) => {
  return uploadMetrics.recordUploadFailure(uploadData, error, startTime);
};

export const getUploadStats = () => {
  return uploadMetrics.getSessionStats();
};

export const getPerformanceAnalysis = () => {
  return {
    stats: uploadMetrics.getPerformanceStats(),
    recommendations: uploadMetrics.analyzePatterns()
  };
};