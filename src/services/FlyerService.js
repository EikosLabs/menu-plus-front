import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateRequired } from '../utils/validation';
import { retryOperation } from '../utils/networkUtils';

export class FlyerService {
	constructor(apiClient) {
		this.apiClient = apiClient;
	}

	async create(flyerData) {
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

	async getById(flyerId) {
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

	async getByMenuId(menuId = null) {
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

	async update(flyerId, flyerData) {
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

	async delete(flyerId) {
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
