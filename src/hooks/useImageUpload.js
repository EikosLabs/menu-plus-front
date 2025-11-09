import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejo de carga de imágenes
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxSizeMB - Tamaño máximo en MB (default: 5)
 * @param {string[]} options.validTypes - Tipos de archivo válidos
 */
export function useImageUpload(options = {}) {
	const {
		maxSizeMB = 5,
		validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
	} = options;

	const [image, setImage] = useState(null);
	const [preview, setPreview] = useState(null);
	const [error, setError] = useState(null);
	const fileInputRef = useRef(null);

	const handleFileChange = useCallback((e) => {
		const file = e.target.files[0];

		// Reset state
		setImage(null);
		setPreview(null);
		setError(null);

		if (!file) return;

		// Validate file type
		if (!validTypes.includes(file.type)) {
			setError(`El archivo debe ser una imagen (${validTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')})`);
			if (fileInputRef.current) {
				fileInputRef.current.value = null;
			}
			return;
		}

		// Validate file size
		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			setError(`La imagen no debe exceder ${maxSizeMB}MB`);
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

		setImage(file);
	}, [maxSizeMB, validTypes]);

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

	return {
		image,
		preview,
		error,
		fileInputRef,
		handleFileChange,
		clearImage,
		setExistingPreview
	};
}
