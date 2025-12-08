import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateFileType, validateFileSize } from '../utils/validation';

export class ImageUploader {
	constructor(apiClient) {
		this.apiClient = apiClient;
		this.endpoint = "/images";
	}

	/**
	 * Handles 413 Payload Too Large errors with specific messaging
	 */
	handle413Error(error, file) {
		const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
		const maxAllowedMB = 10; // Updated to match frontend validation

		return new AppError(
			ERROR_TYPES.PAYLOAD_TOO_LARGE,
			`La imagen es demasiado grande para el servidor (${fileSizeMB}MB). ` +
			`Intenta con una imagen más pequeña o comprímela antes de subirla. ` +
			`Tamaño recomendado: menos de ${maxAllowedMB}MB.`,
			{
				fileName: file.name,
				fileSize: file.size,
				fileSizeMB: parseFloat(fileSizeMB),
				maxAllowedMB,
				suggestions: [
					'Usa una imagen más pequeña',
					'Comprime la imagen antes de subirla',
					'Reduce la calidad o resolución de la imagen',
					'Usa formato JPEG en lugar de PNG'
				]
			}
		);
	}

	/**
	 * Attempts to upload with automatic retry on 413 error
	 */
	async uploadWithRetry(file, maxRetries = 2) {
		let lastError;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await this.upload(file);
			} catch (error) {
				lastError = error;

				// Check if it's a 413 error and we have retries left
				if (error instanceof AppError &&
					(error.status === 413 || error.type === ERROR_TYPES.PAYLOAD_TOO_LARGE) &&
					attempt < maxRetries) {

					errorLogger.warn(`Upload 413 error, retry ${attempt + 1}/${maxRetries}`, {
						fileName: file.name,
						fileSize: file.size,
						attempt: attempt + 1,
						error: error.message
					});

					// Wait a bit before retry
					await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
					continue;
				}

				// For non-413 errors or no retries left, throw the error
				break;
			}
		}

		throw lastError;
	}

	async upload(file) {
		if (!file) {
			return null;
		}

		// Validar tipo de archivo
		const typeError = validateFileType(file, ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);
		if (typeError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, typeError);
		}

		// Validar tamaño (aumentado a 10MB temporalmente para mejor manejo de 413)
		const sizeValidation = validateFileSize(file, 10);
		if (sizeValidation && !sizeValidation.isValid) {
			// validateFileSize retorna un objeto con message, details y suggestions solo cuando es inválido
			throw new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				sizeValidation.message,
				{
					...sizeValidation.details,
					suggestions: sizeValidation.suggestions,
					fileName: file.name
				}
			);
		}

		const formData = new FormData();
		formData.append("File", file);

		const token = this.apiClient.getAuthToken();
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 45000); // Aumentado a 45s

		try {
			const response = await fetch(`${this.apiClient.baseUrl}${this.endpoint}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				if (response.status === 413) {
					throw this.handle413Error(new Error('Payload Too Large'), file);
				}

				const error = await AppError.fromResponse(response, null, { endpoint: this.endpoint, method: 'POST' });
				error.status = response.status;
				throw error;
			}

			const data = await response.json();
			return data.key || data.Key || data.url || data.Url; // Soportar tanto key como url según respuesta del backend
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: this.endpoint, method: 'POST' });
				throw error;
			}

			if (error.name === "AbortError") {
				const timeoutError = new AppError(
					ERROR_TYPES.TIMEOUT_ERROR,
					'La subida de imagen excedió el tiempo límite (45s).'
				);
				errorLogger.error(timeoutError, { endpoint: this.endpoint, timeout: 45000 });
				throw timeoutError;
			}

			const networkError = AppError.fromNetworkError(error, { endpoint: this.endpoint, method: 'POST' });
			errorLogger.error(networkError, { endpoint: this.endpoint });
			throw networkError;
		}
	}
}
