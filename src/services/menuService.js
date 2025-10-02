const API_URL = "/api";

import authService from "./authService";

class ApiClient {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	getAuthToken() {
		const token = authService.getToken();
		if (!token) {
			throw new Error("Usuario no autenticado");
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

			const headers = {
				Authorization: `Bearer ${token}`,
				...(body && { "Content-Type": "application/json" }),
			};

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
						throw new Error(`Error: ${responseText}`);
					}
					data = responseText;
				}
			}

			if (!response.ok) {
				const message =
					data && typeof data === "object" && data.message
						? data.message
						: `Error: ${response.status} ${response.statusText}`;
				throw new Error(message);
			}

			return {
				data,
				status: response.status,
				isEmpty: !responseText || responseText.trim() === "",
			};
		} catch (error) {
			clearTimeout(timeoutId);

			if (error.name === "AbortError") {
				throw new Error(
					"La operación excedió el tiempo límite. Intente nuevamente.",
				);
			}

			throw error;
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
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			return await response.blob();
		} catch (error) {
			clearTimeout(timeoutId);

			if (error.name === "AbortError") {
				throw new Error("La operación excedió el tiempo límite.");
			}

			throw error;
		}
	}
}

class StorageHelper {
	static saveToLocalStorage(key, value) {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (_error) {
			return false;
		}
	}

	static getFromLocalStorage(key, defaultValue = null) {
		try {
			const value = localStorage.getItem(key);
			return value ? JSON.parse(value) : defaultValue;
		} catch (_error) {
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
				throw new Error(
					`Error al subir imagen: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();
			return data.key || data.Key || data;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error.name === "AbortError") {
				throw new Error("La subida de imagen excedió el tiempo límite");
			}

			throw error;
		}
	}
}

class BusinessService {
	constructor(apiClient, imageUploader) {
		this.apiClient = apiClient;
		this.imageUploader = imageUploader;
	}

	async create(businessData) {
		const businessPayload = {
			...businessData,
			businessCategoryId: businessData.businessCategoryId || 1,
		};

		const response = await this.apiClient.post(
			"/food-businesses",
			businessPayload,
		);

		if (response.isEmpty) {
			return { ...businessPayload, id: Date.now() };
		}

		if (response.data?.id) {
			StorageHelper.saveBusinessForUser(businessData.userId, response.data.id);
		}

		return response.data;
	}

	async update(businessId, businessData) {
		const businessPayload = {
			...businessData,
			businessCategoryId: businessData.businessCategoryId || 1,
		};

		const response = await this.apiClient.patch(
			`/food-businesses/${businessId}`,
			businessPayload,
		);

		if (response.isEmpty) {
			return { ...businessPayload, id: businessId };
		}

		return response.data;
	}

	async getById(id) {
		const response = await this.apiClient.get(`/food-businesses/${id}`);

		if (response.isEmpty) {
			throw new Error(`No se encontró el negocio con ID ${id}`);
		}

		const business = response.data;

		try {
			const menuResponse = await this.apiClient.get(
				`/menus/food-business/${business.id}`,
			);
			business.menus = menuResponse.isEmpty
				? []
				: Array.isArray(menuResponse.data)
					? menuResponse.data
					: [menuResponse.data];
		} catch (_error) {
			business.menus = [];
		}

		return business;
	}

	async getByUserId(userId) {
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

			try {
				const menuResponse = await this.apiClient.get(
					`/menus/food-business/${business.id}`,
				);

				if (!menuResponse.isEmpty && menuResponse.data) {
					const menuData = menuResponse.data;

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
						} catch (_error) {
							menuData.menuItems = [];
						}
					}

					business.menus = [menuData];
				}
			} catch (_error) {
				business.menus = [];
			}

			return [business];
		} catch (_error) {
			return [];
		}
	}

	async getCategories() {
		try {
			const response = await this.apiClient.get("/business-categories");
			return response.isEmpty ? [] : response.data;
		} catch (_error) {
			return [];
		}
	}

	async getQRCode(businessId) {
		const blob = await this.apiClient.fetchBinary(
			`/food-businesses/${businessId}/qr-code`,
		);
		return URL.createObjectURL(blob);
	}
}

class MenuService {
	constructor(apiClient, imageUploader) {
		this.apiClient = apiClient;
		this.imageUploader = imageUploader;
	}

	async create(menuData) {
		if (!(menuData.name && menuData.foodBusinessId)) {
			throw new Error("El nombre del menú y el ID del negocio son requeridos");
		}

		const menuPayload = {
			name: menuData.name,
			description: menuData.description || "",
			foodBusinessId: Number.parseInt(menuData.foodBusinessId, 10),
		};

		const response = await this.apiClient.post("/menus", menuPayload);

		if (response.isEmpty) {
			return { ...menuPayload, id: Date.now() };
		}

		return response.data;
	}

	async getById(id) {
		try {
			const response = await this.apiClient.get(`/menus/${id}`);

			if (response.isEmpty) {
				return { id, name: "Menú no disponible", description: "", items: [] };
			}

			return response.data;
		} catch (_error) {
			return { id, name: "Menú no disponible", description: "", items: [] };
		}
	}

	validateMenuItem(menuItemData) {
		if (!(menuItemData.name && menuItemData.menuId && menuItemData.price)) {
			throw new Error("El nombre, precio y ID del menú son requeridos");
		}

		if (
			Number.isNaN(Number.parseFloat(menuItemData.price)) ||
			Number.parseFloat(menuItemData.price) <= 0
		) {
			throw new Error("El precio debe ser un número mayor que cero");
		}
	}

	prepareMenuItemPayload(menuItemData, imageKey = null) {
		return {
			name: menuItemData.name,
			description: menuItemData.description || "",
			price: Number.parseFloat(menuItemData.price),
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
		this.validateMenuItem(menuItemData);

		let imageKey = null;
		if (menuItemData.image) {
			imageKey = await this.imageUploader.upload(menuItemData.image);
		}

		const payload = this.prepareMenuItemPayload(menuItemData, imageKey);
		const response = await this.apiClient.post("/menu-item", payload);

		if (response.isEmpty) {
			return {
				id: Date.now(),
				...payload,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
		}

		return response.data;
	}

	async updateMenuItem(itemId, menuItemData) {
		const payload = {
			name: menuItemData.name,
			description: menuItemData.description,
			price: Number.parseFloat(menuItemData.price),
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

		const response = await this.apiClient.put(`/menu-item/${itemId}`, payload);

		if (response.isEmpty) {
			return {
				id: itemId,
				...payload,
				updatedAt: new Date().toISOString(),
			};
		}

		return response.data;
	}

	async deleteMenuItem(itemId) {
		await this.apiClient.delete(`/menu-item/${itemId}`);
		return true;
	}

	async getMenuItems(menuId) {
		try {
			const response = await this.apiClient.get(`/menu-items?menuId=${menuId}`);
			return response.isEmpty ? [] : response.data;
		} catch (_error) {
			return [];
		}
	}

	async getMenuItemCategories() {
		try {
			const response = await this.apiClient.get("/menu-item-category");
			return response.isEmpty ? [] : response.data;
		} catch (_error) {
			return [];
		}
	}

	async createSection(menuId, sectionData) {
		if (!sectionData.name) {
			throw new Error("El nombre de la sección es requerido");
		}

		const sectionPayload = {
			name: sectionData.name,
			description: sectionData.description || "",
		};

		const response = await this.apiClient.post(
			`/menus/${menuId}/section`,
			sectionPayload,
		);

		if (response.isEmpty) {
			return {
				...sectionPayload,
				id: Date.now(),
				menuId,
				order: 0,
			};
		}

		return response.data;
	}

	async moveSectionUp(menuId, sectionId) {
		const response = await this.apiClient.put(
			`/menus/${menuId}/section/${sectionId}/move-up`,
		);
		return response.data;
	}

	async moveSectionDown(menuId, sectionId) {
		const response = await this.apiClient.put(
			`/menus/${menuId}/section/${sectionId}/move-down`,
		);
		return response.data;
	}

	async getSections(menuId) {
		try {
			const menuResponse = await this.apiClient.get(`/menus/${menuId}`);
			if (menuResponse.isEmpty || !menuResponse.data) {
				return [];
			}

			return menuResponse.data.sections || [];
		} catch (_error) {
			return [];
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

	uploadImage: (file) => imageUploader.upload(file),

	_saveBusinessIdForUser: (userId, businessId) =>
		StorageHelper.saveBusinessForUser(userId, businessId),
	_getBusinessIdsForUser: (userId) =>
		StorageHelper.getBusinessesForUser(userId),
};
