import { useState, useCallback, useRef } from 'react';
import { compressImage, formatFileSize, getOptimalCompressionSettings } from '../utils/imageCompression.js';
import { validateImageFile } from '../utils/imageCompression.js';

/**
 * Hook personalizado para manejo de carga de imágenes con compresión automática
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxSizeMB - Tamaño máximo en MB (default: 3, reducido para permitir compresión)
 * @param {string[]} options.validTypes - Tipos de archivo válidos
 * @param {boolean} options.enableCompression - Habilitar compresión automática (default: true)
 * @param {boolean} options.showCompressionProgress - Mostrar progreso de compresión (default: true)
 * @param {function} options.onCompressionProgress - Callback para progreso de compresión
 * @param {function} options.onCompressionComplete - Callback cuando compresión completa
 */
export function useImageUpload(options = {}) {
	const {
		maxSizeMB = 3, // Reducido para permitir margen de compresión
		validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
		enableCompression = true,
		showCompressionProgress = true,
		onCompressionProgress,
		onCompressionComplete
	} = options;

	const [image, setImage] = useState(null);
	const [preview, setPreview] = useState(null);
	const [error, setError] = useState(null);
	const [isCompressing, setIsCompressing] = useState(false);
	const [compressionProgress, setCompressionProgress] = useState(null);
	const [originalSize, setOriginalSize] = useState(null);
	const [compressedSize, setCompressedSize] = useState(null);
	const [compressionStats, setCompressionStats] = useState(null);
	const fileInputRef = useRef(null);

	const handleCompressionProgress = useCallback((progress) => {
		if (showCompressionProgress) {
			setCompressionProgress(progress);
		}
		onCompressionProgress?.(progress);
	}, [showCompressionProgress, onCompressionProgress]);

	const clearCompressionState = useCallback(() => {
		setIsCompressing(false);
		setCompressionProgress(null);
		setOriginalSize(null);
		setCompressedSize(null);
		setCompressionStats(null);
	}, []);

	const handleFileChange = useCallback(async (e) => {
		const file = e.target.files[0];

		// Reset state
		setImage(null);
		setPreview(null);
		setError(null);
		clearCompressionState();

		if (!file) return;

		// Validate file type and size using utility
		const validation = validateImageFile(file);
		if (!validation.isValid) {
			setError(validation.error);
			if (fileInputRef.current) {
				fileInputRef.current.value = null;
			}
			return;
		}

		// Additional validation for our specific max size
		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes && !enableCompression) {
			setError(`La imagen no debe exceder ${maxSizeMB}MB. Intenta con una imagen más pequeña.`);
			if (fileInputRef.current) {
				fileInputRef.current.value = null;
			}
			return;
		}

		try {
			let finalFile = file;
			let shouldCompress = enableCompression && file.size > 1 * 1024 * 1024; // Comprimir si > 1MB

			// Get optimal compression settings based on file size
			const compressionOptions = getOptimalCompressionSettings(file.size);

			if (shouldCompress) {
				setIsCompressing(true);
				setOriginalSize(file.size);

				const compressionResult = await compressImage(file, compressionOptions, handleCompressionProgress);

				if (compressionResult.success && compressionResult.compressedFile !== file) {
					finalFile = compressionResult.compressedFile;
					setCompressedSize(finalFile.size);
					setCompressionStats({
						originalSize: compressionResult.originalSize,
						compressedSize: compressionResult.compressedSize,
						compressionRatio: compressionResult.compressionRatio,
						processingTime: compressionResult.processingTime
					});

					console.log(`[ImageUpload] Compression complete: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(compressionResult.compressedSize)} (${compressionResult.compressionRatio.toFixed(1)}% reduction in ${compressionResult.processingTime.toFixed(0)}ms)`);

					onCompressionComplete?.(compressionResult);
				} else if (!compressionResult.success) {
					// Si la compresión falla, continuar con el archivo original
					console.warn(`[ImageUpload] Compression failed: ${compressionResult.error}`);
					setCompressionStats({
						originalSize: file.size,
						compressedSize: file.size,
						compressionRatio: 0,
						processingTime: compressionResult.processingTime,
						error: compressionResult.error
					});
				}
			}

			// Final validation of compressed file
			if (finalFile.size > maxSizeBytes * 2) { // Permitir hasta 2x el tamaño máximo después de compresión fallida
				setError(`La imagen es demasiado grande (${formatFileSize(finalFile.size)}). Máximo permitido: ${formatFileSize(maxSizeBytes)}`);
				if (fileInputRef.current) {
					fileInputRef.current.value = null;
				}
				clearCompressionState();
				return;
			}

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(finalFile);

			// Update image with potential file name preservation
			const processedFile = new File([finalFile], file.name, {
				type: finalFile.type,
				lastModified: Date.now()
			});

			setImage(processedFile);

		} catch (error) {
			console.error('[ImageUpload] Error processing file:', error);
			setError(`Error procesando la imagen: ${error.message}`);
			if (fileInputRef.current) {
				fileInputRef.current.value = null;
			}
			clearCompressionState();
		}
	}, [maxSizeMB, enableCompression, showCompressionProgress, onCompressionProgress, onCompressionComplete, clearCompressionState, handleCompressionProgress]);

	const clearImage = useCallback(() => {
		setImage(null);
		setPreview(null);
		setError(null);
		clearCompressionState();
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}
	}, [clearCompressionState]);

	const setExistingPreview = useCallback((url) => {
		setPreview(url);
		setImage(null);
		clearCompressionState();
	}, [clearCompressionState]);

	const retryCompression = useCallback(async (customOptions = {}) => {
		if (!image || !enableCompression) return;

		setIsCompressing(true);
		setCompressionProgress({ stage: 'compressing', progress: 0, message: 'Reintentando compresión...' });

		try {
			const compressionOptions = { ...getOptimalCompressionSettings(image.size), ...customOptions };
			const compressionResult = await compressImage(image, compressionOptions, handleCompressionProgress);

			if (compressionResult.success && compressionResult.compressedFile !== image) {
				const compressedFile = compressionResult.compressedFile;
				setCompressedSize(compressedFile.size);
				setCompressionStats({
					originalSize: compressionResult.originalSize,
					compressedSize: compressionResult.compressedSize,
					compressionRatio: compressionResult.compressionRatio,
					processingTime: compressionResult.processingTime
				});

				// Update preview
				const reader = new FileReader();
				reader.onloadend = () => {
					setPreview(reader.result);
				};
				reader.readAsDataURL(compressedFile);

				// Update image with preserved name
				const processedFile = new File([compressedFile], image.name, {
					type: compressedFile.type,
					lastModified: Date.now()
				});

				setImage(processedFile);
				onCompressionComplete?.(compressionResult);
			}
		} catch (error) {
			setError(`Error en reintento de compresión: ${error.message}`);
		} finally {
			setIsCompressing(false);
		}
	}, [image, enableCompression, handleCompressionProgress, onCompressionComplete]);

	// Utility functions for UI
	const getCompressionInfo = useCallback(() => {
		if (!compressionStats) return null;

		const { originalSize, compressedSize, compressionRatio, processingTime, error } = compressionStats;

		return {
			originalSize: formatFileSize(originalSize),
			compressedSize: formatFileSize(compressedSize),
			compressionRatio: compressionRatio.toFixed(1),
			processingTime: processingTime.toFixed(0),
			spaceSaved: formatFileSize(originalSize - compressedSize),
			wasCompressed: compressionRatio > 0,
			error
		};
	}, [compressionStats]);

	const getFileSizeInfo = useCallback(() => {
		if (!image) return null;

		return {
			currentSize: formatFileSize(image.size),
			originalSize: originalSize ? formatFileSize(originalSize) : formatFileSize(image.size),
			isCompressed: compressedSize !== null && compressedSize < originalSize,
			compressionSaved: originalSize && compressedSize ? formatFileSize(originalSize - compressedSize) : null
		};
	}, [image, originalSize, compressedSize]);

	return {
		// Core state
		image,
		preview,
		error,
		fileInputRef,

		// Compression state
		isCompressing,
		compressionProgress,
		compressionStats,

		// Actions
		handleFileChange,
		clearImage,
		setExistingPreview,
		retryCompression,

		// Utility functions for UI
		getCompressionInfo,
		getFileSizeInfo,

		// State helpers
		hasImage: !!image,
		hasCompressionStats: !!compressionStats,
		isImageTooLarge: image && image.size > maxSizeMB * 1024 * 1024
	};
}
