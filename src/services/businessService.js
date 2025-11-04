/**
 * Servicio de negocios (Food Business)
 * Maneja todas las operaciones relacionadas con negocios
 */

import { StorageHelper } from './api/storageHelper.js';

export class BusinessService {
  constructor(apiClient, imageUploader) {
    this.apiClient = apiClient;
    this.imageUploader = imageUploader;
  }

  async create(businessData) {
    const businessPayload = {
      ...businessData,
      businessCategoryId: businessData.businessCategoryId || 1
    };

    const response = await this.apiClient.post('/food-businesses', businessPayload);

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
      businessCategoryId: businessData.businessCategoryId || 1
    };

    const response = await this.apiClient.patch(
      `/food-businesses/${businessId}`,
      businessPayload
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

    // Cargar menús asociados
    try {
      const menuResponse = await this.apiClient.get(`/menus/food-business/${business.id}`);
      business.menus = menuResponse.isEmpty
        ? []
        : Array.isArray(menuResponse.data)
          ? menuResponse.data
          : [menuResponse.data];
    } catch {
      business.menus = [];
    }

    return business;
  }

  async getByUserId(userId) {
    try {
      const response = await this.apiClient.get(`/food-businesses/user/${userId}`);

      if (response.isEmpty || !response.data) {
        return [];
      }

      const business = Array.isArray(response.data) ? response.data[0] : response.data;

      if (!business) {
        return [];
      }

      business.menus = [];

      // Cargar menú con items
      try {
        const menuResponse = await this.apiClient.get(`/menus/food-business/${business.id}`);

        if (!menuResponse.isEmpty && menuResponse.data) {
          const menuData = menuResponse.data;

          // Si el menú no tiene items, cargarlos
          if (!(menuData.menuItems && Array.isArray(menuData.menuItems))) {
            try {
              const menuItemsResponse = await this.apiClient.get(`/menu-item/${menuData.id}`);
              menuData.menuItems =
                !menuItemsResponse.isEmpty && Array.isArray(menuItemsResponse.data)
                  ? menuItemsResponse.data
                  : [];
            } catch {
              menuData.menuItems = [];
            }
          }

          business.menus = [menuData];
        }
      } catch {
        business.menus = [];
      }

      return [business];
    } catch {
      return [];
    }
  }

  async getCategories() {
    try {
      const response = await this.apiClient.get('/business-categories');
      return response.isEmpty ? [] : response.data;
    } catch {
      return [];
    }
  }

  async getQRCode(businessId) {
    const blob = await this.apiClient.fetchBinary(`/food-businesses/${businessId}/qr-code`);
    return URL.createObjectURL(blob);
  }
}
