const API_URL = import.meta.env.PUBLIC_API_URL || "/api";

import authService from "./authService";
import { addCsrfHeader } from "../utils/security.js";
import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateRequired, validatePrice, validateFileType, validateFileSize } from '../utils/validation';

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
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
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
			}

			if (!response.ok) {
				// Usar AppError.fromResponse para manejar errores HTTP
				throw await AppError.fromResponse(response, null, { endpoint, method });
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
				throw await AppError.fromResponse(response, null, { endpoint, method: 'GET' });
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

	async upload(file) {
		if (!file) {
			return null;
		}

		// Validar tipo de archivo
		const typeError = validateFileType(file, ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);
		if (typeError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, typeError);
		}

		// Validar tamaño (5MB max)
		const sizeError = validateFileSize(file, 5);
		if (sizeError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, sizeError);
		}

		const formData = new FormData();
		formData.append("File", file);

		const token = this.apiClient.getAuthToken();
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000);

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
				throw await AppError.fromResponse(response, 'Error al subir la imagen', {
					endpoint: this.endpoint,
					fileName: file.name,
					fileSize: file.size,
				});
			}

			const data = await response.json();
			const imageKey = data.key || data.Key || data;

			errorLogger.info('Image uploaded successfully', {
				fileName: file.name,
				fileSize: file.size,
				imageKey,
			});

			return imageKey;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof AppError) {
				errorLogger.error(error, { endpoint: this.endpoint, fileName: file.name });
				throw error;
			}

			if (error.name === "AbortError") {
				const timeoutError = new AppError(
					ERROR_TYPES.TIMEOUT_ERROR,
					'La subida de imagen excedió el tiempo límite. Por favor intenta con una imagen más pequeña.'
				);
				errorLogger.error(timeoutError, { fileName: file.name, fileSize: file.size });
				throw timeoutError;
			}

			const networkError = AppError.fromNetworkError(error, { endpoint: this.endpoint, fileName: file.name });
			errorLogger.error(networkError, { fileName: file.name });
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

		const businessPayload = {
			...businessData,
			businessCategoryId: businessData.businessCategoryId || 1,
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
			StorageHelper.saveBusinessForUser(businessData.userId, response.data.id);
			errorLogger.info('Business created successfully', {
				businessId: response.data.id,
				userId: businessData.userId,
			});
		}

		return response.data;
	}

	async update(businessId, businessData) {
		if (!businessId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del negocio es requerido');
		}

		const businessPayload = {
			...businessData,
			businessCategoryId: businessData.businessCategoryId || 1,
		};

		const response = await retryOperation(
			() => this.apiClient.patch(`/food-businesses/${businessId}`, businessPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Business update returned empty response', { businessId, businessData });
			return { ...businessPayload, id: businessId };
		}

		errorLogger.info('Business updated successfully', { businessId });
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

	async getByUserId(userId) {
		if (!userId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID de usuario es requerido');
		}

		try {
			const response = await this.apiClient.get(
				`/food-businesses/user/${userId}`,
			);

			if (response.isEmpty || !response.data) {
				return [];
			}

			const business = Array.isArray(response.data)
				? response.data[0]
				: response.data;

			if (!business) {
				return [];
			}

			business.menus = [];

			// Intentar cargar menús
			try {
				const menuResponse = await this.apiClient.get(
					`/menus/food-business/${business.id}`,
				);

				if (!menuResponse.isEmpty && menuResponse.data) {
					const menuData = menuResponse.data;

					// Cargar items del menú si no están incluidos
					if (!(menuData.menuItems && Array.isArray(menuData.menuItems))) {
						try {
							const menuItemsResponse = await this.apiClient.get(
								`/menu-item/${menuData.id}`,
							);
							menuData.menuItems =
								!menuItemsResponse.isEmpty &&
								Array.isArray(menuItemsResponse.data)
									? menuItemsResponse.data
									: [];
						} catch (error) {
							if (error instanceof AppError && error.type !== ERROR_TYPES.NOT_FOUND) {
								errorLogger.warn('Failed to load menu items', {
									menuId: menuData.id,
									error: error.message,
								});
							}
							menuData.menuItems = [];
						}
					}

					business.menus = [menuData];
				}
			} catch (error) {
				if (error instanceof AppError && error.type !== ERROR_TYPES.NOT_FOUND) {
					errorLogger.warn('Failed to load menus for user business', {
						businessId: business.id,
						userId,
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

			// Para otros errores (como 404), retornar array vacío pero registrar
			errorLogger.warn('Failed to load businesses for user', {
				userId,
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

	async getQRCode(businessId) {
		if (!businessId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del negocio es requerido');
		}

		try {
			const blob = await retryOperation(
				() => this.apiClient.fetchBinary(`/food-businesses/${businessId}/qr-code`),
				{ maxRetries: 2 }
			);

			const qrUrl = URL.createObjectURL(blob);
			errorLogger.info('QR Code generated successfully', { businessId });
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
		const businessIdError = validateRequired(menuData.foodBusinessId, 'El ID del negocio');

		if (nameError || businessIdError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'Por favor completa todos los campos requeridos', {
				fieldErrors: {
					...(nameError && { name: nameError }),
					...(businessIdError && { foodBusinessId: businessIdError }),
				}
			});
		}

		const menuPayload = {
			name: menuData.name,
			description: menuData.description || "",
			foodBusinessId: Number.parseInt(menuData.foodBusinessId, 10),
		};

		const response = await retryOperation(
			() => this.apiClient.post("/menus", menuPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Menu creation returned empty response', { menuData });
			return { ...menuPayload, id: Date.now() };
		}

		errorLogger.info('Menu created successfully', { menuId: response.data.id });
		return response.data;
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

		const menuIdError = validateRequired(menuItemData.menuId, 'El ID del menú');
		if (menuIdError) errors.menuId = menuIdError;

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
			name: menuItemData.name,
			description: menuItemData.description || "",
			price: Number.parseFloat(menuItemData.price),
			currencyType: menuItemData.currencyType !== undefined ? Number.parseInt(menuItemData.currencyType) : 0,
			menuId: menuItemData.menuId,
			isAvailable:
				menuItemData.isAvailable === undefined
					? true
					: menuItemData.isAvailable,
			menuItemCategoryId: menuItemData.menuItemCategoryId || null,
			sectionId: menuItemData.sectionId || null,
			order: menuItemData.order || 0,
			...(imageKey && { imageKey }),
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

		const payload = {
			name: menuItemData.name,
			description: menuItemData.description,
			price: Number.parseFloat(menuItemData.price),
			currencyType: menuItemData.currencyType !== undefined ? Number.parseInt(menuItemData.currencyType) : undefined,
			isAvailable:
				menuItemData.isAvailable === undefined
					? true
					: menuItemData.isAvailable,
			menuItemCategoryId: menuItemData.menuItemCategoryId || null,
			sectionId: menuItemData.sectionId,
			order: menuItemData.order,
			...(menuItemData.imageKey && { imageKey: menuItemData.imageKey }),
		};

		Object.keys(payload).forEach(
			(key) => payload[key] === undefined && delete payload[key],
		);

		try {
			const response = await retryOperation(
				() => this.apiClient.put(`/menu-item/${itemId}`, payload),
				{ maxRetries: 2 }
			);

			if (response.isEmpty) {
				errorLogger.warn('Menu item update returned empty response', { itemId, menuItemData });
				return {
					id: itemId,
					...payload,
					updatedAt: new Date().toISOString(),
				};
			}

			errorLogger.info('Menu item updated successfully', { itemId });
			return response.data;
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

	async getMenuItems(menuId) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		try {
			const response = await this.apiClient.get(`/menu-items?menuId=${menuId}`);
			return response.isEmpty ? [] : response.data;
		} catch (error) {
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { menuId, operation: 'getMenuItems' });
			throw error;
		}
	}

	async getMenuItemCategories() {
		try {
			const response = await this.apiClient.get("/menu-item-category");
			return response.isEmpty ? [] : response.data;
		} catch (error) {
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
			name: sectionData.name,
			description: sectionData.description || "",
		};

		const response = await retryOperation(
			() => this.apiClient.post(`/menus/${menuId}/section`, sectionPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Section creation returned empty response', { menuId, sectionData });
			return {
				...sectionPayload,
				id: Date.now(),
				menuId,
				order: 0,
			};
		}

		errorLogger.info('Section created successfully', { menuId, sectionId: response.data.id });
		return response.data;
	}

	async moveSectionUp(menuId, sectionId) {
		if (!menuId || !sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú y de la sección son requeridos');
		}

		try {
			const response = await this.apiClient.put(
				`/menus/${menuId}/section/${sectionId}/move-up`,
			);
			errorLogger.info('Section moved up', { menuId, sectionId });
			return response.data;
		} catch (error) {
			errorLogger.error(error, { menuId, sectionId, operation: 'moveSectionUp' });
			throw error;
		}
	}

	async moveSectionDown(menuId, sectionId) {
		if (!menuId || !sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú y de la sección son requeridos');
		}

		try {
			const response = await this.apiClient.put(
				`/menus/${menuId}/section/${sectionId}/move-down`,
			);
			errorLogger.info('Section moved down', { menuId, sectionId });
			return response.data;
		} catch (error) {
			errorLogger.error(error, { menuId, sectionId, operation: 'moveSectionDown' });
			throw error;
		}
	}

	async getSections(menuId) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		try {
			const menuResponse = await this.apiClient.get(`/menus/${menuId}`);
			if (menuResponse.isEmpty || !menuResponse.data) {
				return [];
			}

			return menuResponse.data.sections || [];
		} catch (error) {
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { menuId, operation: 'getSections' });
			throw error;
		}
	}

	async createFlyer(menuId, flyerData) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		const nameError = validateRequired(flyerData.name, 'El nombre del folleto/carta');
		if (nameError) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, nameError, {
				fieldErrors: { name: nameError }
			});
		}

		const flyerPayload = {
			name: flyerData.name,
			type: flyerData.type || "folleto",
			templateId: flyerData.templateId || "elegante",
			selectedItemIds: flyerData.selectedItemIds || "",
			itemsOrder: flyerData.itemsOrder || "",
			paperSize: flyerData.paperSize || "A4",
			menuId: menuId,
		};

		const response = await retryOperation(
			() => this.apiClient.post(`/menus/${menuId}/flyers`, flyerPayload),
			{ maxRetries: 2 }
		);

		if (response.isEmpty) {
			errorLogger.warn('Flyer creation returned empty response', { menuId, flyerData });
			return {
				...flyerPayload,
				id: Date.now(),
				createdAt: new Date().toISOString(),
			};
		}

		errorLogger.info('Flyer created successfully', { menuId, flyerId: response.data.id });
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

	async getFlyersByMenu(menuId) {
		if (!menuId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del menú es requerido');
		}

		try {
			const response = await this.apiClient.get(`/menus/${menuId}/flyers`);

			if (response.isEmpty) {
				return [];
			}

			return response.data;
		} catch (error) {
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { menuId, operation: 'getFlyersByMenu' });
			throw error;
		}
	}

	async updateFlyer(flyerId, flyerData) {
		if (!flyerId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'El ID del folleto es requerido');
		}

		const flyerPayload = {
			name: flyerData.name,
			type: flyerData.type,
			templateId: flyerData.templateId,
			selectedItemIds: flyerData.selectedItemIds,
			itemsOrder: flyerData.itemsOrder,
			paperSize: flyerData.paperSize,
			pdfKey: flyerData.pdfKey,
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
}

const apiClient = new ApiClient(API_URL);
const imageUploader = new ImageUploader(apiClient);
const businessService = new BusinessService(apiClient, imageUploader);
const menuService = new MenuService(apiClient, imageUploader);

export default {
	createFoodBusiness: (data) => businessService.create(data),
	updateFoodBusiness: (id, data) => businessService.update(id, data),
	getFoodBusiness: (id) => businessService.getById(id),
	getUserBusinesses: (userId) => businessService.getByUserId(userId),
	getBusinessCategories: () => businessService.getCategories(),
	getBusinessQRCode: (id) => businessService.getQRCode(id),

	createMenu: (data) => menuService.create(data),
	getMenu: (id) => menuService.getById(id),

	createMenuItem: (data) => menuService.createMenuItem(data),
	updateMenuItem: (itemId, data) => menuService.updateMenuItem(itemId, data),
	deleteMenuItem: (itemId) => menuService.deleteMenuItem(itemId),
	getMenuItems: (menuId) => menuService.getMenuItems(menuId),
	getMenuItemCategories: () => menuService.getMenuItemCategories(),

	createSection: (menuId, data) => menuService.createSection(menuId, data),
	getSections: (menuId) => menuService.getSections(menuId),
	moveSectionUp: (menuId, sectionId) =>
		menuService.moveSectionUp(menuId, sectionId),
	moveSectionDown: (menuId, sectionId) =>
		menuService.moveSectionDown(menuId, sectionId),

	createFlyer: (menuId, data) => menuService.createFlyer(menuId, data),
	getFlyer: (flyerId) => menuService.getFlyer(flyerId),
	getFlyersByMenu: (menuId) => menuService.getFlyersByMenu(menuId),
	updateFlyer: (flyerId, data) => menuService.updateFlyer(flyerId, data),
	deleteFlyer: (flyerId) => menuService.deleteFlyer(flyerId),

	uploadImage: (file) => imageUploader.upload(file),

	_saveBusinessIdForUser: (userId, businessId) =>
		StorageHelper.saveBusinessForUser(userId, businessId),
	_getBusinessIdsForUser: (userId) =>
		StorageHelper.getBusinessesForUser(userId),
};
