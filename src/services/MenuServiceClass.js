import { AppError } from '../utils/AppError';
import { ERROR_TYPES } from '../utils/errorTypes';
import { errorLogger } from '../utils/errorLogger';
import { validateRequired, validatePrice } from '../utils/validation';
import { normalizeId, normalizeMenuItemIds } from '../utils/idNormalization';
import { retryOperation } from '../utils/networkUtils';

export class MenuService {
	constructor(apiClient, imageUploader) {
		this.apiClient = apiClient;
		this.imageUploader = imageUploader;
	}

	async create(menuData) {
		// Validaciones con errores específicos por campo
		const nameError = validateRequired(menuData.name, 'El nombre del menú');
		
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
			CurrencyType: menuItemData.currencyType !== undefined ? Number.parseInt(menuItemData.currencyType) : undefined,
			MenuItemCategoryId: menuItemData.menuItemCategoryId || menuItemData.categoryId || null,
			SectionId: menuItemData.sectionId || null,
			IsAvailable: menuItemData.isAvailable !== false,
			...(imageKey && { ImageKey: imageKey }),
		};
	}

	async createMenuItem(menuItemData) {
		this.validateMenuItem(menuItemData);

		try {
			let imageKey = null;
			if (menuItemData.image) {
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
				IsAvailable: menuItemData.isAvailable === undefined ? true : menuItemData.isAvailable,
				MenuItemCategoryId: menuItemData.menuItemCategoryId || null,
				SectionId: normalizeId(menuItemData.sectionId),
				Order: menuItemData.order,
				MenuId: normalizeId(menuItemData.menuId),
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
		try {
			const response = await this.apiClient.get(`/menus/food-business`);
			if (response.isEmpty || !response.data) {
				return [];
			}

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
		try {
			const response = await this.apiClient.get(`/menus/food-business`);
			
			if (response.isEmpty || !response.data) {
				return [];
			}

			const menu = response.data;
			return menu.sections || [];
		} catch (error) {
			if (error instanceof AppError && error.type === ERROR_TYPES.NOT_FOUND) {
				return [];
			}
			errorLogger.error(error, { operation: 'getSections' });
			throw error;
		}
	}

	async moveSectionUp(menuId, sectionId) {
		if (!menuId || !sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'IDs requeridos');
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
		if (!menuId || !sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'IDs requeridos');
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

	async deleteSection(menuId, sectionId) {
		if (!menuId || !sectionId) {
			throw new AppError(ERROR_TYPES.VALIDATION_ERROR, 'IDs requeridos');
		}

		try {
			await retryOperation(
				() => this.apiClient.delete(`/menus/${menuId}/section/${sectionId}`),
				{ maxRetries: 2 }
			);

			errorLogger.info('Section deleted successfully', { sectionId });
			return true;
		} catch (error) {
			errorLogger.error(error, { sectionId, operation: 'deleteSection' });
			throw error;
		}
	}
}
