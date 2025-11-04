/**
 * Servicio de menú principal (refactorizado)
 * Punto de entrada único para todas las operaciones de negocios y menús
 *
 * Antes: 618 líneas con múltiples clases en un solo archivo
 * Ahora: Modular, separado en servicios especializados
 */

import { apiClient } from './api/apiClient.js';
import { ImageUploader } from './api/imageUploader.js';
import { StorageHelper } from './api/storageHelper.js';
import { BusinessService } from './businessService.js';
import { MenuService } from './menuServiceCore.js';

// Inicializar servicios
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

	uploadImage: (file) => imageUploader.upload(file),

	_saveBusinessIdForUser: (userId, businessId) =>
		StorageHelper.saveBusinessForUser(userId, businessId),
	_getBusinessIdsForUser: (userId) =>
		StorageHelper.getBusinessesForUser(userId),
};
