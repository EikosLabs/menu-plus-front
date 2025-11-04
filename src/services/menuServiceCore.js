/**
 * Servicio de menús e items
 * Maneja todas las operaciones relacionadas con menús, items y secciones
 */

export class MenuService {
  constructor(apiClient, imageUploader) {
    this.apiClient = apiClient;
    this.imageUploader = imageUploader;
  }

  // ============ MENÚS ============

  async create(menuData) {
    if (!(menuData.name && menuData.foodBusinessId)) {
      throw new Error('El nombre del menú y el ID del negocio son requeridos');
    }

    const menuPayload = {
      name: menuData.name,
      description: menuData.description || '',
      foodBusinessId: Number.parseInt(menuData.foodBusinessId, 10)
    };

    const response = await this.apiClient.post('/menus', menuPayload);

    if (response.isEmpty) {
      return { ...menuPayload, id: Date.now() };
    }

    return response.data;
  }

  async getById(id) {
    try {
      const response = await this.apiClient.get(`/menus/${id}`);

      if (response.isEmpty) {
        return { id, name: 'Menú no disponible', description: '', items: [] };
      }

      return response.data;
    } catch {
      return { id, name: 'Menú no disponible', description: '', items: [] };
    }
  }

  // ============ ITEMS DE MENÚ ============

  validateMenuItem(menuItemData) {
    if (!(menuItemData.name && menuItemData.menuId && menuItemData.price)) {
      throw new Error('El nombre, precio y ID del menú son requeridos');
    }

    const price = Number.parseFloat(menuItemData.price);
    if (Number.isNaN(price) || price <= 0) {
      throw new Error('El precio debe ser un número mayor que cero');
    }
  }

  prepareMenuItemPayload(menuItemData, imageKey = null) {
    return {
      name: menuItemData.name,
      description: menuItemData.description || '',
      price: Number.parseFloat(menuItemData.price),
      menuId: menuItemData.menuId,
      isAvailable: menuItemData.isAvailable ?? true,
      menuItemCategoryId: menuItemData.menuItemCategoryId || null,
      sectionId: menuItemData.sectionId || null,
      order: menuItemData.order || 0,
      ...(imageKey && { imageKey })
    };
  }

  async createMenuItem(menuItemData) {
    this.validateMenuItem(menuItemData);

    let imageKey = null;
    if (menuItemData.image) {
      imageKey = await this.imageUploader.upload(menuItemData.image);
    }

    const payload = this.prepareMenuItemPayload(menuItemData, imageKey);
    const response = await this.apiClient.post('/menu-item', payload);

    if (response.isEmpty) {
      return {
        id: Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return response.data;
  }

  async updateMenuItem(itemId, menuItemData) {
    const payload = {
      name: menuItemData.name,
      description: menuItemData.description,
      price: Number.parseFloat(menuItemData.price),
      isAvailable: menuItemData.isAvailable ?? true,
      menuItemCategoryId: menuItemData.menuItemCategoryId || null,
      sectionId: menuItemData.sectionId,
      order: menuItemData.order,
      ...(menuItemData.imageKey && { imageKey: menuItemData.imageKey })
    };

    // Eliminar valores undefined
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    const response = await this.apiClient.put(`/menu-item/${itemId}`, payload);

    if (response.isEmpty) {
      return {
        id: itemId,
        ...payload,
        updatedAt: new Date().toISOString()
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
    } catch {
      return [];
    }
  }

  async getMenuItemCategories() {
    try {
      const response = await this.apiClient.get('/menu-item-category');
      return response.isEmpty ? [] : response.data;
    } catch {
      return [];
    }
  }

  // ============ SECCIONES ============

  async createSection(menuId, sectionData) {
    if (!sectionData.name) {
      throw new Error('El nombre de la sección es requerido');
    }

    const sectionPayload = {
      name: sectionData.name,
      description: sectionData.description || ''
    };

    const response = await this.apiClient.post(
      `/menus/${menuId}/section`,
      sectionPayload
    );

    if (response.isEmpty) {
      return {
        ...sectionPayload,
        id: Date.now(),
        menuId,
        order: 0
      };
    }

    return response.data;
  }

  async moveSectionUp(menuId, sectionId) {
    const response = await this.apiClient.put(
      `/menus/${menuId}/section/${sectionId}/move-up`
    );
    return response.data;
  }

  async moveSectionDown(menuId, sectionId) {
    const response = await this.apiClient.put(
      `/menus/${menuId}/section/${sectionId}/move-down`
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
    } catch {
      return [];
    }
  }
}
