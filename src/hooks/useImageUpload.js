import { useState, useCallback, useRef } from 'react';
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
		maxSizeMB = 10, // Actualizado a 10MB como solicitado
		validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
		enableCompression = false, // Desactivada para evitar errores
		showCompressionProgress = true,
		onCompressionProgress,
		onCompressionComplete
	} = options;

	const [image, setImage] = useState(null);
	const [preview, setPreview] = useState(null);
	const [error, setError] = useState(null);
	// Variables de compresión eliminadas - ya no se usan
	const fileInputRef = useRef(null);

	// Funciones de compresión eliminadas - ya no se usan

	const handleFileChange = useCallback(async (e) => {
		// Validate that e.target.files exists and has at least one file
		if (!e.target?.files || e.target.files.length === 0) {
			return;
		}

		const file = e.target.files[0];

		// Reset state
		setImage(null);
		setPreview(null);
		setError(null);

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
			// Validación de tamaño final
			if (file.size > maxSizeBytes) {
				setError(`La imagen excede el tamaño máximo de ${maxSizeMB}MB. Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
				if (fileInputRef.current) {
					fileInputRef.current.value = null;
				}
				return;
			}

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);

			// Usar el archivo original sin compresión
			setImage(file);

		} catch (error) {
			console.error('[ImageUpload] Error processing file:', error);
			setError(`Error procesando la imagen: ${error.message}`);
			if (fileInputRef.current) {
				fileInputRef.current.value = null;
			}
		}
	}, [maxSizeMB]);

	const clearImage = useCallback(() => {
		setImage(null);
		setPreview(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = null;
		}
	}, []);

	const setExistingPreview = useCallback((url) => {
		setPreview(url);
		setImage(null);
	}, []);

	// Utility functions simplificadas sin compresión
	const getFileSizeInfo = useCallback(() => {
		if (!image) return null;

		return {
			currentSize: `${(image.size / (1024 * 1024)).toFixed(1)}MB`,
			originalSize: `${(image.size / (1024 * 1024)).toFixed(1)}MB`,
			isCompressed: false,
			compressionSaved: null
		};
	}, [image]);

	return {
		// Core state
		image,
		preview,
		error,
		fileInputRef,

		// Actions
		handleFileChange,
		clearImage,
		setExistingPreview,

		// Utility functions for UI
		getFileSizeInfo,

		// State helpers
		hasImage: !!image,
		isImageTooLarge: image && image.size > maxSizeMB * 1024 * 1024
	};
}
