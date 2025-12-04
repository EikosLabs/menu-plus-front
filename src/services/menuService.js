const API_URL = import.meta.env.PUBLIC_API_URL || "/api";

import authService from "./authService";
import { TokenInterceptor } from "./tokenInterceptor.js";
import { addCsrfHeader } from "../utils/security.js";
import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateRequired, validatePrice, validateFileType, validateFileSize } from '../utils/validation';
import { normalizeId, normalizeMenuItemIds } from '../utils/idNormalization';

/**
 * Retry helper con exponential backoff para operaciones de red
 */
async function retryOperation(operation, options = {}) {
	const {
		maxRetries = 3,
		initialDelay = 1000,
		maxDelay = 5000,
		shouldRetry = (error) => error.type === ERROR_TYPES.NETWORK_ERROR || error.type === ERROR_TYPES.TIMEOUT_ERROR,
	} = options;

	let lastError;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof AppError ? error : AppError.fromError(error);

			// No reintentar si no es un error de red/timeout o es el último intento
			if (!shouldRetry(lastError) || attempt === maxRetries - 1) {
				throw lastError;
			}

			// Calcular delay con exponential backoff
			const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
			errorLogger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
				error: lastError.type,
				message: lastError.message,
			});

			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

class ApiClient {
	constructor(baseUrl, tokenInterceptor = null) {
		this.baseUrl = baseUrl;
		this.tokenInterceptor = tokenInterceptor;
	}

	getAuthToken() {
		const token = authService.getToken();
		if (!token) {
			throw new AppError(
				ERROR_TYPES.UNAUTHORIZED,
				'Por favor inicia sesión para continuar'
			);
		}
		return token;
	}

	async makeRequest(endpoint, options = {}) {
		const { method = "GET", body = null, timeout = 10000 } = options;

		// Función que ejecuta el request real
		const executeRequest = async () => {
			const url = `${this.baseUrl}${endpoint}`;
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const token = this.getAuthToken();

				const headers = addCsrfHeader({
					Authorization: `Bearer ${token}`,
					...(body && { "Content-Type": "application/json" }),
				});

				const fetchOptions = {
					method,
					headers,
					credentials: "include",
					signal: controller.signal,
					...(body && { body: JSON.stringify(body) }),
				};

				const response = await fetch(url, fetchOptions);
				clearTimeout(timeoutId);

				const responseText = await response.text();
				let data = null;

				// Mejorar manejo de respuestas vacías
				if (responseText?.trim()) {
					try {
						data = JSON.parse(responseText);
					} catch (_error) {
						if (!response.ok) {
							errorLogger.error(new AppError(
								ERROR_TYPES.SERVER_ERROR,
								'El servidor devolvió una respuesta inválida'
							), { endpoint, method, responseText });

							throw new AppError(
								ERROR_TYPES.SERVER_ERROR,
								'El servidor devolvió una respuesta inválida'
							);
						}
						data = responseText;
					}
				} else if (response.ok) {
					// Respuesta vacía pero exitosa
					errorLogger.warn('Empty response from server', { endpoint, method, status: response.status });
				}

				if (!response.ok) {
					// Crear error con status para que el interceptor lo detecte
					const error = await AppError.fromResponse(response, null, { endpoint, method });
					error.status = response.status;
					throw error;
				}

				return {
					data,
					status: response.status,
					isEmpty: !responseText || responseText.trim() === "",
				};
			} catch (error) {
				clearTimeout(timeoutId);

				// Si ya es AppError, re-lanzar con logging
				if (error instanceof AppError) {
					errorLogger.error(error, { endpoint, method });
					throw error;
				}

				// Timeout error
				if (error.name === "AbortError") {
					const timeoutError = new AppError(
						ERROR_TYPES.TIMEOUT_ERROR,
						'La operación excedió el tiempo límite. Por favor intenta nuevamente.'
					);
					errorLogger.error(timeoutError, { endpoint, method, timeout });
					throw timeoutError;
				}

				// Network error
				const networkError = AppError.fromNetworkError(error, { endpoint, method });
				errorLogger.error(networkError, { endpoint, method });
				throw networkError;
			}
		};

		// Si hay interceptor, usarlo para manejar renovación automática de tokens
		if (this.tokenInterceptor) {
			return this.tokenInterceptor.executeRequest(executeRequest);
		}

		// Si no hay interceptor, ejecutar directamente
		return executeRequest();
	}

	async get(endpoint, options = {}) {
		return this.makeRequest(endpoint, { ...options, method: "GET" });
	}

	async post(endpoint, data, options = {}) {
		return this.makeRequest(endpoint, {
			...options,
			method: "POST",
			body: data,
		});
	}

	async put(endpoint, data, options = {}) {
		return this.makeRequest(endpoint, {
			...options,
			method: "PUT",
			body: data,
		});
	}

	async patch(endpoint, data, options = {}) {
		return this.makeRequest(endpoint, {
			...options,
			method: "PATCH",
			body: data,
		});
	}

	async delete(endpoint, options = {}) {
		return this.makeRequest(endpoint, { ...options, method: "DELETE" });
	}

	async fetchBinary(endpoint, options = {}) {
		const { timeout = 15000 } = options;

		// Función que ejecuta el request binario
		const executeRequest = async () => {
			const url = `${this.baseUrl}${endpoint}`;
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);

			try {
				const token = this.getAuthToken();

				const response = await fetch(url, {
					headers: { Authorization: `Bearer ${token}` },
					credentials: "include",
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					const error = await AppError.fromResponse(response, null, { endpoint, method: 'GET' });
					error.status = response.status;
					throw error;
				}

				return await response.blob();
			} catch (error) {
				clearTimeout(timeoutId);

				if (error instanceof AppError) {
					errorLogger.error(error, { endpoint, method: 'GET', isBinary: true });
					throw error;
				}

				if (error.name === "AbortError") {
					const timeoutError = new AppError(
						ERROR_TYPES.TIMEOUT_ERROR,
						'La descarga excedió el tiempo límite.'
					);
					errorLogger.error(timeoutError, { endpoint, timeout });
					throw timeoutError;
				}

				const networkError = AppError.fromNetworkError(error, { endpoint, isBinary: true });
				errorLogger.error(networkError, { endpoint });
				throw networkError;
			}
		};

		// Si hay interceptor, usarlo
		if (this.tokenInterceptor) {
			return this.tokenInterceptor.executeRequest(executeRequest);
		}

		return executeRequest();
	}
}

class StorageHelper {
	static saveToLocalStorage(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			errorLogger.warn('Failed to save to localStorage', { key, error: error.message });
			return false;
		}
	}

	static getFromLocalStorage(key, defaultValue = null) {
		try {
			const value = localStorage.getItem(key);
			return value ? JSON.parse(value) : defaultValue;
		} catch (error) {
			errorLogger.warn('Failed to read from localStorage', { key, error: error.message });
			return defaultValue;
		}
	}

	static saveBusinessForUser(userId, businessId) {
		const key = `userBusinesses_${userId}`;
		const businesses = StorageHelper.getFromLocalStorage(key, []);

		if (!businesses.includes(businessId)) {
			businesses.push(businessId);
			StorageHelper.saveToLocalStorage(key, businesses);
		}
	}

	static getBusinessesForUser(userId) {
		return StorageHelper.getFromLocalStorage(`userBusinesses_${userId}`, []);
	}
}

class ImageUploader {
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

		const uploadStartTime = performance.now();

		try {
			const response = await fetch(
				`${this.apiClient.baseUrl}${this.endpoint}`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
					credentials: "include",
					signal: controller.signal,
				},
			);

			clearTimeout(timeoutId);

			if (!response.ok) {
				const uploadTime = performance.now() - uploadStartTime;

				// Special handling for 413 Payload Too Large
				if (response.status === 413) {
					const error413 = this.handle413Error(
						new Error('Payload Too Large'),
						file
					);
					error413.status = 413;
					errorLogger.error(error413, {
						endpoint: this.endpoint,
						fileName: file.name,
						fileSize: file.size,
						uploadTime: uploadTime.toFixed(0),
						httpStatus: response.status
					});
					throw error413;
				}

				// Handle other HTTP errors
				const appError = await AppError.fromResponse(response, 'Error al subir la imagen', {
					endpoint: this.endpoint,
					fileName: file.name,
					fileSize: file.size,
					uploadTime: uploadTime.toFixed(0),
				});

				// Add specific error context
				if (response.status >= 400 && response.status < 500) {
					appError.type = ERROR_TYPES.CLIENT_ERROR;
				} else if (response.status >= 500) {
					appError.type = ERROR_TYPES.SERVER_ERROR;
				}

				errorLogger.error(appError, {
					endpoint: this.endpoint,
					fileName: file.name,
					fileSize: file.size,
					httpStatus: response.status,
					uploadTime: uploadTime.toFixed(0)
				});

				throw appError;
			}

			const data = await response.json();
			const imageKey = data.key || data.Key || data;
			const uploadTime = performance.now() - uploadStartTime;

			errorLogger.info('Image uploaded successfully', {
				fileName: file.name,
				fileSize: file.size,
				imageKey,
				uploadTime: uploadTime.toFixed(0),
				uploadSpeed: `${(file.size / (uploadTime / 1000) / 1024).toFixed(1)} KB/s`
			});

			return imageKey;
		} catch (error) {
			clearTimeout(timeoutId);
			const uploadTime = performance.now() - uploadStartTime;

			if (error instanceof AppError) {
				errorLogger.error(error, {
					endpoint: this.endpoint,
					fileName: file.name,
					uploadTime: uploadTime.toFixed(0)
				});
				throw error;
			}

			if (error.name === "AbortError") {
				const timeoutError = new AppError(
					ERROR_TYPES.TIMEOUT_ERROR,
					'La subida de imagen excedió el tiempo límite. Por favor intenta con una imagen más pequeña o verifica tu conexión.',
					{
						fileName: file.name,
						fileSize: file.size,
						timeout: 45000,
						uploadTime: uploadTime.toFixed(0),
						suggestions: [
							'Usa una imagen más pequeña',
							'Verifica tu conexión a internet',
							'Intenta comprimir la imagen antes de subirla'
						]
					}
				);
				errorLogger.error(timeoutError, {
					fileName: file.name,
					fileSize: file.size,
					uploadTime: uploadTime.toFixed(0)
				});
				throw timeoutError;
			}

			const networkError = AppError.fromNetworkError(error, {
				endpoint: this.endpoint,
				fileName: file.name,
				uploadTime: uploadTime.toFixed(0)
			});

			// Add specific context for network errors
			if (error.message.includes('fetch')) {
				networkError.suggestions = [
					'Verifica tu conexión a internet',
					'El servidor puede estar temporalmente fuera de servicio',
					'Intenta nuevamente en unos minutos'
				];
			}

			errorLogger.error(networkError, {
				fileName: file.name,
				uploadTime: uploadTime.toFixed(0)
			});
			throw networkError;
		}
	}
}

class BusinessService {
	constructor(apiClient, imageUploader) {
		this.apiClient = apiClient;
		this.imageUploader = imageUploader;
	}

	async create(businessData) {
		// Validaciones
		const nameError = validateRequired(businessData.name, 'El nombre del negocio');
		if (nameError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, nameError, {
				fieldErrors: { name: nameError }
			});
		}

		// Convertir a PascalCase para el backend
		const businessPayload = {
			Name: businessData.name,
			Description: businessData.description || '',
			Slogan: businessData.slogan || '',
			Address: businessData.address || '',
			PhoneNumber: businessData.phoneNumber || '',
			Email: businessData.email || '',
			BusinessCategoryId: businessData.businessCategoryId || 1,
			ImageKey: businessData.imageKey || null,
			FacebookUrl: businessData.facebookUrl || '',
			InstagramUrl: businessData.instagramUrl || '',
			TwitterUrl: businessData.twitterUrl || '',
			WhatsAppNumber: businessData.whatsAppNumber || '',
			PrimaryColor: businessData.primaryColor || '',
			SecondaryColor: businessData.secondaryColor || '',
			AccentColor: businessData.accentColor || '',
			DefaultCurrency: businessData.defaultCurrency ?? 0,
			Template: businessData.template ?? 0,
			FontFamily: businessData.fontFamily || ''
		};

		// Usar retry para operaciones críticas de creación
		const response = await retryOperation(
			() => this.apiClient.post("/food-businesses", businessPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Business creation returned empty response', { businessData });
			return { ...businessPayload, id: Date.now() };
		}

        if (response.data?.id) {
            // Ya no necesitamos guardar el businessId localmente ya que está en el token
            errorLogger.info('Business created successfully', {
                businessId: response.data.id
            });
        }

		return response.data;
	}

	async update(businessId, businessData) {
		// Ya no necesitamos businessId porque el backend lo obtiene del token
		// Pero lo mantenemos en la firma por compatibilidad

		// Convertir a PascalCase para el backend
		const businessPayload = {
			Name: businessData.name,
			Description: businessData.description,
			Slogan: businessData.slogan,
			Address: businessData.address,
			PhoneNumber: businessData.phoneNumber,
			Email: businessData.email,
			BusinessCategoryId: businessData.businessCategoryId || 1,
			ImageKey: businessData.imageKey,
			FacebookUrl: businessData.facebookUrl,
			InstagramUrl: businessData.instagramUrl,
			TwitterUrl: businessData.twitterUrl,
			WhatsAppNumber: businessData.whatsAppNumber,
			PrimaryColor: businessData.primaryColor,
			SecondaryColor: businessData.secondaryColor,
			AccentColor: businessData.accentColor,
			DefaultCurrency: businessData.defaultCurrency,
			Template: businessData.template,
			FontFamily: businessData.fontFamily
		};

		// Remover campos undefined
		Object.keys(businessPayload).forEach(
			(key) => businessPayload[key] === undefined && delete businessPayload[key]
		);

		// El backend obtiene el businessId del token, no necesitamos pasarlo en la URL
		const response = await retryOperation(
			() => this.apiClient.patch('/food-businesses', businessPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Business update returned empty response', { businessData });
			return { ...businessPayload, id: businessId };
		}

		errorLogger.info('Business updated successfully');
		return response.data;
	}

	async getById(id) {
		if (!id) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del negocio es requerido');
		}

		const response = await this.apiClient.get(`/food-businesses/${id}`);

		if (response.isEmpty) {
			throw new AppError(
				ERROR_TYPES.NOT_FOUND,
				`No se encontró el negocio con ID ${id}`,
				{ businessId: id }
			);
		}

		const business = response.data;

		// Intentar cargar menús pero no fallar si no hay
		try {
			const menuResponse = await this.apiClient.get(
				`/menus/food-business/${business.id}`,
			);
			business.menus = menuResponse.isEmpty
				? []
				: Array.isArray(menuResponse.data)
					? menuResponse.data
					: [menuResponse.data];
		} catch (error) {
			// Solo registrar error si no es 404 (negocio sin menús es válido)
			if (error instanceof AppError && error.type !== ERROR_TYPES.NOT_FOUND) {
				errorLogger.warn('Failed to load menus for business', {
					businessId: business.id,
					error: error.message,
				});
			}
			business.menus = [];
		}

		return business;
	}

	async getByUserId() {
		// El backend obtiene el businessId del token automáticamente
		try {
			// Usar el endpoint correcto para Owner: GET /food-businesses (sin ID)
			// Este endpoint extrae el FoodBusinessId del token en el backend
			const response = await this.apiClient.get('/food-businesses');

			if (response.isEmpty || !response.data) {
				return [];
			}

			const business = response.data;

			// Cargar menús del negocio
			try {
				const menuResponse = await this.apiClient.get(`/menus/food-business`);
				if (!menuResponse.isEmpty && menuResponse.data) {
					business.menus = Array.isArray(menuResponse.data) ? menuResponse.data : [menuResponse.data];
				} else {
					business.menus = [];
				}
			} catch (error) {
				if (error instanceof AppError && error.type !== ERROR_TYPES.NOT_FOUND) {
					errorLogger.warn('Failed to load menus for business', {
						businessId: business.id,
						error: error.message,
					});
				}
				business.menus = [];
			}

			return [business];
		} catch (error) {
			// Si es un error de autenticación o validación, propagarlo
			if (error instanceof AppError &&
				(error.type === ERROR_TYPES.UNAUTHORIZED ||
				 error.type === ERROR_TYPES.VALIDATION_ERROR)) {
				throw error;
			}

			// Para otros errores, retornar array vacío pero registrar
			errorLogger.warn('Failed to load businesses for user', {
				error: error instanceof AppError ? error.message : error.message,
			});
			return [];
		}
	}

	async getCategories() {
		try {
			const response = await this.apiClient.get("/business-categories");
			return response.isEmpty ? [] : response.data;
		} catch (error) {
			errorLogger.error(error, { endpoint: '/business-categories' });
			// Retornar array vacío para categorías no críticas
			return [];
		}
	}

	async getQRCode() {
		// El businessId ahora se obtiene del token, no necesitamos parámetro
		const businessId = authService.getBusinessIdFromToken();
		if (!businessId) {
			throw new AppError(
				ERROR_TYPES.UNAUTHORIZED,
				'No se encontró el ID del negocio en el token'
			);
		}

		try {
			// Primero obtenemos el menú del negocio para obtener su ID
			const menuResponse = await retryOperation(
				() => this.apiClient.get(`/menus/food-business`),
				{ maxRetries: 2 }
			);

			if (menuResponse.isEmpty || !menuResponse.data || !menuResponse.data.id) {
				throw new AppError(
					ERROR_TYPES.NOT_FOUND,
					'No se encontró un menú para este negocio'
				);
			}

			const menuId = menuResponse.data.id;

			// Ahora obtenemos el QR del menú usando el endpoint existente
			const blob = await retryOperation(
				() => this.apiClient.fetchBinary(`/menu/${menuId}/qr-code`),
				{ maxRetries: 2 }
			);

			const qrUrl = URL.createObjectURL(blob);
			errorLogger.info('QR Code generated successfully', { businessId, menuId });
			return qrUrl;
		} catch (error) {
			errorLogger.error(error, { businessId, operation: 'getQRCode' });
			throw error;
		}
	}
}

class MenuService {
	constructor(apiClient, imageUploader) {
		this.apiClient = apiClient;
		this.imageUploader = imageUploader;
	}

	async create(menuData) {
		// Validaciones con errores específicos por campo
		const nameError = validateRequired(menuData.name, 'El nombre del menú');
		
		// Ya no validamos foodBusinessId ya que el backend lo obtiene del token
		if (nameError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'Por favor completa todos los campos requeridos', {
				fieldErrors: {
					...(nameError && { name: nameError }),
				}
			});
		}

		const menuPayload = {
			Name: menuData.name,
			Description: menuData.description || "",
		};

		try {
			const response = await retryOperation(
				() => this.apiClient.post("/menus", menuPayload),
				{ maxRetries: 2 }
			);

			if (response.isEmpty) {
				errorLogger.warn('Menu creation returned empty response', { menuData });
				return {
					...menuPayload,
					id: Date.now(),
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
			}

			errorLogger.info('Menu created successfully', { menuId: response.data.id });
			return response.data;
		} catch (error) {
			const appError = AppError.fromError(error, { menuData });
			errorLogger.error(appError, { menuData });
			throw appError;
		}
	}

	async getById(id) {
		if (!id) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		try {
			const response = await this.apiClient.get(`/menus/${id}`);

			if (response.isEmpty) {
				throw new AppError(
					ERROR_TYPES.NOT_FOUND,
					'Menú no encontrado',
					{ menuId: id }
				);
			}

			return response.data;
		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { menuId: id });
				throw error;
			}

			const appError = AppError.fromError(error, { menuId: id });
			errorLogger.error(appError, { menuId: id });
			throw appError;
		}
	}

	validateMenuItem(menuItemData) {
		const errors = {};

		const nameError = validateRequired(menuItemData.name, 'El nombre');
		if (nameError) errors.name = nameError;

		// Ya no validamos menuId ya que el backend lo obtiene del token
		// const menuIdError = validateRequired(menuItemData.menuId, 'El ID del menú');
		// if (menuIdError) errors.menuId = menuIdError;

		const priceError = validatePrice(menuItemData.price, 'El precio');
		if (priceError) errors.price = priceError;

		if (Object.keys(errors).length > 0) {
			throw new AppError(
				ERROR_TYPES.VALIDATION_ERROR,
				'Por favor corrige los errores en el formulario',
				{ fieldErrors: errors }
			);
		}
	}

	prepareMenuItemPayload(menuItemData, imageKey = null) {
		return {
			MenuId: Number.parseInt(menuItemData.menuId, 10),
			Name: menuItemData.name,
			Description: menuItemData.description || "",
			Price: Number.parseFloat(menuItemData.price),
			MenuItemCategoryId: menuItemData.categoryId || null,
			SectionId: menuItemData.sectionId || null,
			IsAvailable: menuItemData.isAvailable !== false,
			...(imageKey && { ImageKey: imageKey }),
		};
	}

	async createMenuItem(menuItemData) {
		// Validar campos (lanza AppError con fieldErrors si falla)
		this.validateMenuItem(menuItemData);

		try {
			let imageKey = null;
			if (menuItemData.image) {
				// La subida de imagen ya tiene validación y manejo de errores
				imageKey = await this.imageUploader.upload(menuItemData.image);
			}

			const payload = this.prepareMenuItemPayload(menuItemData, imageKey);

			const response = await retryOperation(
				() => this.apiClient.post("/menu-item", payload),
				{ maxRetries: 2 }
			);

			if (response.isEmpty) {
				errorLogger.warn('Menu item creation returned empty response', { menuItemData });
				return {
					id: Date.now(),
					...payload,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
			}

			errorLogger.info('Menu item created successfully', {
				menuItemId: response.data.id,
				menuId: menuItemData.menuId,
			});

			return response.data;
		} catch (error) {
			// Los errores de validación ya son AppError, solo necesitamos propagar
			if (error instanceof AppError) {
				errorLogger.error(error, { menuItemData });
				throw error;
			}

			const appError = AppError.fromError(error, { menuItemData });
			errorLogger.error(appError, { menuItemData });
			throw appError;
		}
	}

	async updateMenuItem(itemId, menuItemData) {
		if (!itemId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del item es requerido');
		}

		try {
			// Upload new image if provided
			let imageKey = menuItemData.imageKey;
			if (menuItemData.image) {
				imageKey = await this.imageUploader.upload(menuItemData.image);
				errorLogger.info('Image uploaded for menu item update', { itemId, imageKey });
			}

			const payload = {
				Name: menuItemData.name,
				Description: menuItemData.description,
				Price: menuItemData.price !== undefined ? Number.parseFloat(menuItemData.price) : undefined,
				CurrencyType: menuItemData.currencyType !== undefined ? Number.parseInt(menuItemData.currencyType) : undefined,
				IsAvailable:
					menuItemData.isAvailable === undefined
						? true
						: menuItemData.isAvailable,
				MenuItemCategoryId: menuItemData.menuItemCategoryId || null,
				SectionId: normalizeId(menuItemData.sectionId),  // ← NORMALIZADO A STRING
				Order: menuItemData.order,
				MenuId: normalizeId(menuItemData.menuId),        // ← NORMALIZADO A STRING
				...(imageKey && { ImageKey: imageKey }),
			};

			Object.keys(payload).forEach(
				(key) => payload[key] === undefined && delete payload[key],
			);

			const response = await retryOperation(
				() => this.apiClient.put(`/menu-item/${itemId}`, payload),
				{ maxRetries: 2 }
			);

			if (response.isEmpty) {
				errorLogger.warn('Menu item update returned empty response', { itemId, menuItemData });
				const fallbackResponse = {
					id: itemId,
					...payload,
					updatedAt: new Date().toISOString(),
				};
				return normalizeMenuItemIds(fallbackResponse);
			}

			errorLogger.info('Menu item updated successfully', { itemId });
			return normalizeMenuItemIds(response.data);
		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { itemId, menuItemData });
				throw error;
			}

			const appError = AppError.fromError(error, { itemId, menuItemData });
			errorLogger.error(appError, { itemId });
			throw appError;
		}
	}

	async deleteMenuItem(itemId) {
		if (!itemId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del item es requerido');
		}

		try {
			await retryOperation(
				() => this.apiClient.delete(`/menu-item/${itemId}`),
				{ maxRetries: 2 }
			);

			errorLogger.info('Menu item deleted successfully', { itemId });
			return true;
		} catch (error) {
			errorLogger.error(error, { itemId, operation: 'deleteMenuItem' });
			throw error;
		}
	}

	async getMenuItems() {
		// El backend devuelve menuItems dentro del menú completo en /menus/food-business
		try {
			const response = await this.apiClient.get(`/menus/food-business`);
			if (response.isEmpty || !response.data) {
				return [];
			}

			// Extraer todos los menuItems de todas las secciones
			const menu = response.data;
			const allMenuItems = [];
			if (menu.sections && Array.isArray(menu.sections)) {
				menu.sections.forEach(section => {
					if (section.menuItems && Array.isArray(section.menuItems)) {
						allMenuItems.push(...section.menuItems);
					}
				});
			}
			return allMenuItems;
		} catch (error) {
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { operation: 'getMenuItems' });
			throw error;
		}
	}

	async getMenuItemCategories() {
		try {
			const response = await this.apiClient.get("/menu-item-category");
			console.log('[MenuService] getMenuItemCategories - Response:', response);
			return response.isEmpty ? [] : response.data;
		} catch (error) {
			console.error('[MenuService] getMenuItemCategories - Error:', error);
			errorLogger.warn('Failed to load menu item categories', { error: error.message });
			return [];
		}
	}

	async createSection(menuId, sectionData) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		const nameError = validateRequired(sectionData.name, 'El nombre de la sección');
		if (nameError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, nameError, {
				fieldErrors: { name: nameError }
			});
		}

		const sectionPayload = {
			Name: sectionData.name,
			Description: sectionData.description || "",
		};

		const response = await retryOperation(
			() => this.apiClient.post(`/menus/${menuId}/section`, sectionPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Section creation returned empty response', { sectionData });
			return {
				...sectionPayload,
				id: Date.now(),
				order: 0,
			};
		}

		errorLogger.info('Section created successfully', { sectionId: response.data.id });
		return response.data;
	}

	async getSections() {
		// El backend devuelve sections dentro del menú completo en /menus/food-business
		try {
			const response = await this.apiClient.get(`/menus/food-business`);
			console.log('[MenuService] getSections - Full response:', response);
			
			if (response.isEmpty || !response.data) {
				console.log('[MenuService] getSections - Empty response');
				return [];
			}

			const menu = response.data;
			console.log('[MenuService] getSections - Menu data:', menu);
			console.log('[MenuService] getSections - Sections:', menu.sections);
			
			return menu.sections || [];
		} catch (error) {
			console.error('[MenuService] getSections - Error:', error);
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { operation: 'getSections' });
			throw error;
		}
	}

	async createFlyer(flyerData) {
		if (!flyerData.menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		const nameError = validateRequired(flyerData.name, 'El nombre del folleto/carta');
		if (nameError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, nameError, {
				fieldErrors: { name: nameError }
			});
		}

		const flyerPayload = {
			Name: flyerData.name,
			Type: flyerData.type || "folleto",
			TemplateId: flyerData.templateId || "elegante",
			SelectedItemIds: flyerData.selectedItemIds || "",
			ItemsOrder: flyerData.itemsOrder || "",
			PaperSize: flyerData.paperSize || "A4",
		};

		const response = await retryOperation(
			() => this.apiClient.post(`/menus/${flyerData.menuId}/flyers`, flyerPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Flyer creation returned empty response', { flyerData });
			return {
				...flyerPayload,
				id: Date.now(),
				createdAt: new Date().toISOString(),
			};
		}

		errorLogger.info('Flyer created successfully', { flyerId: response.data.id });
		return response.data;
	}

	async getFlyer(flyerId) {
		if (!flyerId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del folleto es requerido');
		}

		try {
			const response = await this.apiClient.get(`/flyers/${flyerId}`);

			if (response.isEmpty) {
				throw new AppError(
					ERROR_TYPES.NOT_FOUND,
					`Folleto con ID ${flyerId} no encontrado`,
					{ flyerId }
				);
			}

			return response.data;
		} catch (error) {
			if (error instanceof AppError) {
				errorLogger.error(error, { flyerId });
				throw error;
			}

			const appError = AppError.fromError(error, { flyerId });
			errorLogger.error(appError, { flyerId });
			throw appError;
		}
	}

	async getFlyersByMenu(menuId = null) {
		try {
			// Si no se proporciona menuId, obtenerlo del menú del negocio
			if (!menuId) {
				const menuResponse = await this.apiClient.get(`/menus/food-business`);
				if (menuResponse.isEmpty || !menuResponse.data || !menuResponse.data.id) {
					return [];
				}
				menuId = menuResponse.data.id;
			}

			const response = await this.apiClient.get(`/menus/${menuId}/flyers`);

			if (response.isEmpty) {
				return [];
			}

			return response.data;
		} catch (error) {
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { operation: 'getFlyersByMenu', menuId });
			throw error;
		}
	}

	async updateFlyer(flyerId, flyerData) {
		if (!flyerId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del folleto es requerido');
		}

		const flyerPayload = {
			Name: flyerData.name,
			Type: flyerData.type,
			TemplateId: flyerData.templateId,
			SelectedItemIds: flyerData.selectedItemIds,
			ItemsOrder: flyerData.itemsOrder,
			PaperSize: flyerData.paperSize,
			PdfKey: flyerData.pdfKey,
		};

		Object.keys(flyerPayload).forEach(
			(key) => flyerPayload[key] === undefined && delete flyerPayload[key],
		);

		try {
			const response = await retryOperation(
				() => this.apiClient.put(`/flyers/${flyerId}`, flyerPayload),
				{ maxRetries: 2 }
			);

			if (response.isEmpty) {
				errorLogger.warn('Flyer update returned empty response', { flyerId, flyerData });
				return {
					id: flyerId,
					...flyerPayload,
					updatedAt: new Date().toISOString(),
				};
			}

			errorLogger.info('Flyer updated successfully', { flyerId });
			return response.data;
		} catch (error) {
			errorLogger.error(error, { flyerId, flyerData });
			throw error;
		}
	}

	async deleteFlyer(flyerId) {
		if (!flyerId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del folleto es requerido');
		}

		try {
			await retryOperation(
				() => this.apiClient.delete(`/flyers/${flyerId}`),
				{ maxRetries: 2 }
			);

			errorLogger.info('Flyer deleted successfully', { flyerId });
			return true;
		} catch (error) {
			errorLogger.error(error, { flyerId, operation: 'deleteFlyer' });
			throw error;
		}
	}

	async moveSectionUp(menuId, sectionId) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}
		if (!sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID de la sección es requerido');
		}

		try {
			const response = await this.apiClient.put(
				`/menus/${menuId}/section/${sectionId}/move-up`,
			);
			errorLogger.info('Section moved up', { sectionId });
			return response.data;
		} catch (error) {
			errorLogger.error(error, { sectionId, operation: 'moveSectionUp' });
			throw error;
		}
	}

	async moveSectionDown(menuId, sectionId) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}
		if (!sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID de la sección es requerido');
		}

		try {
			const response = await this.apiClient.put(
				`/menus/${menuId}/section/${sectionId}/move-down`,
			);
			errorLogger.info('Section moved down', { sectionId });
			return response.data;
		} catch (error) {
			errorLogger.error(error, { sectionId, operation: 'moveSectionDown' });
			throw error;
		}
	}
}

// Crear instancia global de TokenInterceptor con authService
const tokenInterceptor = new TokenInterceptor(authService);

// Crear instancia de ApiClient con TokenInterceptor
const apiClient = new ApiClient(API_URL, tokenInterceptor);

// Crear servicios con el ApiClient configurado
const imageUploader = new ImageUploader(apiClient);
const businessService = new BusinessService(apiClient, imageUploader);
const menuService = new MenuService(apiClient, imageUploader);

export default {
	createFoodBusiness: (data) => businessService.create(data),
	updateFoodBusiness: (id, data) => businessService.update(id, data),
	getFoodBusiness: (id) => businessService.getById(id),
	getUserBusinesses: () => businessService.getByUserId(), // Ya no requiere userId
	getBusinessCategories: () => businessService.getCategories(),
	getBusinessQRCode: () => businessService.getQRCode(), // Ya no requiere ID

	createMenu: (data) => menuService.create(data),
	getMenu: (id) => menuService.getById(id),

	createMenuItem: (data) => menuService.createMenuItem(data),
	updateMenuItem: (itemId, data) => menuService.updateMenuItem(itemId, data),
	deleteMenuItem: (itemId) => menuService.deleteMenuItem(itemId),
	getMenuItems: () => menuService.getMenuItems(), // Ya no requiere menuId
	getMenuItemCategories: () => menuService.getMenuItemCategories(),

	createSection: (menuId, data) => menuService.createSection(menuId, data),
	getSections: () => menuService.getSections(),
	moveSectionUp: (menuId, sectionId) => menuService.moveSectionUp(menuId, sectionId),
	moveSectionDown: (menuId, sectionId) => menuService.moveSectionDown(menuId, sectionId),

	createFlyer: (data) => menuService.createFlyer(data), // Ya no requiere menuId
	getFlyer: (flyerId) => menuService.getFlyer(flyerId),
	getFlyersByMenu: () => menuService.getFlyersByMenu(), // Ya no requiere menuId
	updateFlyer: (flyerId, data) => menuService.updateFlyer(flyerId, data),
	deleteFlyer: (flyerId) => menuService.deleteFlyer(flyerId),

	uploadImage: (file) => imageUploader.upload(file),

	_saveBusinessIdForUser: (userId, businessId) =>
		StorageHelper.saveBusinessForUser(userId, businessId),
	_getBusinessIdsForUser: (userId) =>
		StorageHelper.getBusinessesForUser(userId),
};
