import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateRequired } from '../utils/validation';
import { retryOperation } from '../utils/networkUtils';
import authService from './authService';

export class BusinessService {
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
			BusinessCategoryId: businessData.businessCategoryId ? Number.parseInt(businessData.businessCategoryId, 10) : undefined,
			ImageKey: businessData.imageKey,
			FacebookUrl: businessData.facebookUrl,
			InstagramUrl: businessData.instagramUrl,
			TwitterUrl: businessData.twitterUrl,
			WhatsAppNumber: businessData.whatsAppNumber,
			PrimaryColor: businessData.primaryColor,
			SecondaryColor: businessData.secondaryColor,
			AccentColor: businessData.accentColor,
			DefaultCurrency: businessData.defaultCurrency !== undefined ? Number.parseInt(businessData.defaultCurrency, 10) : undefined,
			Template: businessData.template !== undefined ? Number.parseInt(businessData.template, 10) : undefined,
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
