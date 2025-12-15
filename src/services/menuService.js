const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

import authService from "./authService";
import { TokenInterceptor } from "./tokenInterceptor.js";
import { ApiClient } from "./ApiClient.js";
import { ImageUploader } from "./ImageUploader.js";
import { BusinessService } from "./BusinessService.js";
import { MenuService } from "./MenuServiceClass.js";
import { FlyerService } from "./FlyerService.js";
import { StorageHelper } from "../utils/storageHelper.js";

// Crear instancia global de TokenInterceptor con authService
const tokenInterceptor = new TokenInterceptor(authService);

// Crear instancia de ApiClient con TokenInterceptor
const apiClient = new ApiClient(API_URL, authService, tokenInterceptor);

// Crear servicios con el ApiClient configurado
const imageUploader = new ImageUploader(apiClient);
const businessService = new BusinessService(apiClient, imageUploader);
const menuService = new MenuService(apiClient, imageUploader);
const flyerService = new FlyerService(apiClient);

export default {
	createFoodBusiness: (data) => businessService.create(data),
	updateFoodBusiness: (id, data) => businessService.update(id, data),
	getFoodBusiness: (id) => businessService.getById(id),
	getUserBusinesses: () => businessService.getByUserId(),
	getBusinessCategories: () => businessService.getCategories(),
	getBusinessQRCode: () => businessService.getQRCode(),

	createMenu: (data) => menuService.create(data),
	getMenu: (id) => menuService.getById(id),

	createMenuItem: (data) => menuService.createMenuItem(data),
	updateMenuItem: (itemId, data) => menuService.updateMenuItem(itemId, data),
	deleteMenuItem: (itemId) => menuService.deleteMenuItem(itemId),
	getMenuItems: () => menuService.getMenuItems(),
	getMenuItemCategories: () => menuService.getMenuItemCategories(),

	createSection: (menuId, data) => menuService.createSection(menuId, data),
	getSections: () => menuService.getSections(),
	moveSectionUp: (menuId, sectionId) => menuService.moveSectionUp(menuId, sectionId),
	moveSectionDown: (menuId, sectionId) => menuService.moveSectionDown(menuId, sectionId),
	deleteSection: (menuId, sectionId) => menuService.deleteSection(menuId, sectionId),

	createFlyer: (menuId, data) => flyerService.create({ ...data, menuId }),
	getFlyer: (flyerId) => flyerService.getById(flyerId),
	getFlyersByMenu: (menuId) => flyerService.getByMenuId(menuId),
	updateFlyer: (flyerId, data) => flyerService.update(flyerId, data),
	deleteFlyer: (flyerId) => flyerService.delete(flyerId),

	uploadImage: (file) => imageUploader.upload(file),

	_saveBusinessIdForUser: (userId, businessId) =>
		StorageHelper.saveBusinessForUser(userId, businessId),
	_getBusinessIdsForUser: (userId) =>
		StorageHelper.getBusinessesForUser(userId),
};
