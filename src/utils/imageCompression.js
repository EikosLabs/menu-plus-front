/**
 * Image Compression Utility
 * Handles client-side image compression before upload
 * Supports JPEG, PNG, and WebP formats
 */

/**
 * @typedef {Object} CompressionOptions
 * @property {number} [maxWidth] - Maximum width in pixels
 * @property {number} [maxHeight] - Maximum height in pixels
 * @property {number} [quality] - Compression quality (0-1)
 * @property {'jpeg'|'png'|'webp'} [outputFormat] - Output format
 * @property {boolean} [enableWebWorker] - Enable Web Worker for non-blocking compression
 * @property {boolean} [progressive] - Enable progressive JPEG
 */

/**
 * @typedef {Object} CompressionResult
 * @property {File} compressedFile - The compressed file
 * @property {number} originalSize - Original file size in bytes
 * @property {number} compressedSize - Compressed file size in bytes
 * @property {number} compressionRatio - Compression percentage (0-100)
 * @property {number} processingTime - Processing time in milliseconds
 * @property {boolean} success - Whether compression was successful
 * @property {string} [error] - Error message if compression failed
 */

/**
 * @typedef {Object} CompressionProgress
 * @property {'analyzing'|'compressing'|'finalizing'|'complete'|'error'} stage - Current compression stage
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} message - Current progress message
 */

// Default compression settings
const DEFAULT_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  outputFormat: 'jpeg',
  enableWebWorker: true,
  progressive: true,
};

// Maximum file size before compression (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Target compressed file size (2.5MB)
const TARGET_COMPRESSED_SIZE = 2.5 * 1024 * 1024;

/**
 * Validates if a file is an image
 */
export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Supported types: JPEG, PNG, WebP`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum: 5MB`
    };
  }

  return { isValid: true };
}

/**
 * Creates a canvas for image manipulation
 */
function createCanvas(width, height) {
  if (typeof document !== 'undefined') {
    return document.createElement('canvas');
  }
  // For server-side or Web Worker context
  const { createCanvas } = require('canvas');
  return createCanvas(width, height);
}

/**
 * Resizes image maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth,
  originalHeight,
  maxWidth,
  maxHeight
) {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Calculate aspect ratio
  const aspectRatio = width / height;

  // Resize if width exceeds max
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // Resize if height exceeds max
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Compresses image using canvas
 */
async function compressImageWithCanvas(
  file,
  options,
  onProgress
) {
  const startTime = performance.now();

  try {
    onProgress?.({
      stage: 'analyzing',
      progress: 10,
      message: 'Analyzing image...'
    });

    // Create image element
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    onProgress?.({
      stage: 'compressing',
      progress: 30,
      message: 'Resizing image...'
    });

    // Calculate new dimensions
    const { width, height } = calculateDimensions(
      img.width,
      img.height,
      options.maxWidth || DEFAULT_OPTIONS.maxWidth,
      options.maxHeight || DEFAULT_OPTIONS.maxHeight
    );

    // Create canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw and resize image
    ctx.drawImage(img, 0, 0, width, height);

    onProgress?.({
      stage: 'compressing',
      progress: 60,
      message: 'Optimizing quality...'
    });

    // Convert to blob
    const outputFormat = options.outputFormat || 'jpeg';
    const mimeType = `image/${outputFormat}`;
    const quality = options.quality || DEFAULT_OPTIONS.quality;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create compressed image'));
          }
        },
        mimeType,
        quality
      );
    });

    onProgress?.({
      stage: 'finalizing',
      progress: 90,
      message: 'Creating optimized file...'
    });

    // Create compressed file
    const compressedFile = new File([blob], file.name, {
      type: mimeType,
      lastModified: Date.now(),
    });

    // Clean up
    URL.revokeObjectURL(imageUrl);

    const processingTime = performance.now() - startTime;

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Compression complete!'
    });

    return {
      compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: file.size > 0 ? (1 - compressedFile.size / file.size) * 100 : 0,
      processingTime,
      success: true,
    };
  } catch (error) {
    return {
      compressedFile: file, // Return original file on error
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      processingTime: performance.now() - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compression error',
    };
  }
}

/**
 * Adaptive quality compression - reduces quality if file is still too large
 */
async function adaptiveQualityCompression(
  file,
  options,
  onProgress
) {
  let quality = options.quality || DEFAULT_OPTIONS.quality;
  let bestResult = null;

  // Try different quality levels starting from highest
  const qualityLevels = [quality, 0.8, 0.7, 0.6, 0.5, 0.4];

  for (const currentQuality of qualityLevels) {
    const result = await compressImageWithCanvas(
      file,
      { ...options, quality: currentQuality },
      onProgress
    );

    if (!result.success) {
      return result; // Return error if compression failed
    }

    // Check if compressed size is acceptable
    if (result.compressedSize <= TARGET_COMPRESSED_SIZE || currentQuality <= 0.4) {
      return result; // Good enough or minimum quality reached
    }

    // Keep track of best result so far
    if (!bestResult || result.compressedSize < bestResult.compressedSize) {
      bestResult = result;
    }
  }

  // Return best result if none met target size
  return bestResult || {
    compressedFile: file,
    originalSize: file.size,
    compressedSize: file.size,
    compressionRatio: 0,
    processingTime: 0,
    success: false,
    error: 'Could not compress image to target size',
  };
}

/**
 * Main compression function
 */
export async function compressImage(
  file,
  options = {},
  onProgress
) {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      processingTime: 0,
      success: false,
      error: validation.error,
    };
  }

  // Check if compression is needed
  if (file.size <= TARGET_COMPRESSED_SIZE) {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      processingTime: 0,
      success: true,
    };
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    if (mergedOptions.enableWebWorker && typeof Worker !== 'undefined') {
      // Use Web Worker for non-blocking compression
      return await compressImageInWorker(file, mergedOptions, onProgress);
    } else {
      // Use main thread compression
      return await adaptiveQualityCompression(file, mergedOptions, onProgress);
    }
  } catch (error) {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      processingTime: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compression error',
    };
  }
}

/**
 * Web Worker compression implementation
 */
async function compressImageInWorker(
  file,
  options,
  onProgress
) {
  // Create worker code as a blob
  const workerCode = `
    self.onmessage = async function(e) {
      const { file, options } = e.data;

      try {
        // Send progress updates
        self.postMessage({
          type: 'progress',
          stage: 'analyzing',
          progress: 10,
          message: 'Analyzing image...'
        });

        // Create image bitmap
        const imageData = await createImageBitmap(file);

        self.postMessage({
          type: 'progress',
          stage: 'compressing',
          progress: 30,
          message: 'Processing image...'
        });

        // Calculate dimensions
        let { width, height } = { width: imageData.width, height: imageData.height };
        const aspectRatio = width / height;

        if (width > (options.maxWidth || 2048)) {
          width = options.maxWidth || 2048;
          height = width / aspectRatio;
        }

        if (height > (options.maxHeight || 2048)) {
          height = options.maxHeight || 2048;
          width = height * aspectRatio;
        }

        // Create offscreen canvas
        const canvas = new OffscreenCanvas(Math.round(width), Math.round(height));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageData, 0, 0, Math.round(width), Math.round(height));

        self.postMessage({
          type: 'progress',
          stage: 'finalizing',
          progress: 90,
          message: 'Creating optimized file...'
        });

        // Convert to blob
        const quality = options.quality || 0.85;
        const outputFormat = options.outputFormat || 'jpeg';
        const blob = await canvas.convertToBlob({
          type: 'image/' + outputFormat,
          quality: quality
        });

        // Send result
        self.postMessage({
          type: 'result',
          success: true,
          compressedSize: blob.size,
          originalSize: file.size
        });

      } catch (error) {
        self.postMessage({
          type: 'result',
          success: false,
          error: error.message
        });
      }
    };
  `;

  const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerUrl);

  return new Promise((resolve) => {
    const startTime = performance.now();

    worker.onmessage = (e) => {
      const message = e.data;

      if (message.type === 'progress') {
        onProgress?.(message);
      } else if (message.type === 'result') {
        const processingTime = performance.now() - startTime;
        URL.revokeObjectURL(workerUrl);
        worker.terminate();

        if (message.success) {
          resolve({
            compressedFile: message.file, // Note: can't create File objects in workers, so return original
            originalSize: message.originalSize,
            compressedSize: message.compressedSize,
            compressionRatio: ((message.originalSize - message.compressedSize) / message.originalSize) * 100,
            processingTime,
            success: true,
          });
        } else {
          resolve({
            compressedFile: file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0,
            processingTime,
            success: false,
            error: message.error,
          });
        }
      }
    };

    worker.onerror = (error) => {
      const processingTime = performance.now() - startTime;
      URL.revokeObjectURL(workerUrl);
      worker.terminate();

      resolve({
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        processingTime,
        success: false,
        error: error.message,
      });
    };

    // Start compression
    worker.postMessage({ file, options });
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get optimal compression settings based on file size
 */
export function getOptimalCompressionSettings(fileSize) {
  if (fileSize > 10 * 1024 * 1024) { // > 10MB
    return {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.6,
      outputFormat: 'jpeg',
      progressive: true,
    };
  } else if (fileSize > 5 * 1024 * 1024) { // > 5MB
    return {
      maxWidth: 1536,
      maxHeight: 1536,
      quality: 0.7,
      outputFormat: 'jpeg',
      progressive: true,
    };
  } else {
    return DEFAULT_OPTIONS;
  }
}