import authService from './authService';

// Configurar la URL de la API con la dirección IP y puerto donde se está ejecutando el backend
const API_URL = 'https://localhost:5001/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getAuthToken() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    return token;
  }

  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', body = null, timeout = 10000 } = options;
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const token = this.getAuthToken();
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...(body && { 'Content-Type': 'application/json' })
      };
      
      const fetchOptions = {
        method,
        headers,
        credentials: 'include',
        signal: controller.signal,
        ...(body && { body: JSON.stringify(body) })
      };
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      const responseText = await response.text();
      let data = null;
      
      if (responseText && responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          if (!response.ok) {
            throw new Error(`Error: ${responseText}`);
          }
          data = responseText;
        }
      }
      
      if (!response.ok) {
        const message = data && typeof data === 'object' && data.message 
          ? data.message 
          : `Error: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }
      
      return { data, status: response.status, isEmpty: !responseText || responseText.trim() === '' };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('La operación excedió el tiempo límite. Intente nuevamente.');
      }
      
      throw error;
    }
  }
  
  async get(endpoint, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'GET' });
  }
  
  async post(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'POST', body: data });
  }
  
  async put(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'PUT', body: data });
  }
  
  async delete(endpoint, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'DELETE' });
  }
  
  async fetchBinary(endpoint, options = {}) {
    const { timeout = 15000 } = options;
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const token = this.getAuthToken();
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('La operación excedió el tiempo límite.');
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
    } catch (error) {
      return false;
    }
  }
  
  static getFromLocalStorage(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
  
  static saveBusinessForUser(userId, businessId) {
    const key = `userBusinesses_${userId}`;
    const businesses = this.getFromLocalStorage(key, []);
    
    if (!businesses.includes(businessId)) {
      businesses.push(businessId);
      this.saveToLocalStorage(key, businesses);
    }
  }
  
  static getBusinessesForUser(userId) {
    return this.getFromLocalStorage(`userBusinesses_${userId}`, []);
  }
}

class ImageUploader {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.endpoint = '/images';
  }
  
  async upload(file) {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('File', file);
    
    const token = this.apiClient.getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${this.apiClient.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error al subir imagen: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.key || data.Key || data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('La subida de imagen excedió el tiempo límite');
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
      businessCategoryId: businessData.businessCategoryId || 1
    };
    
    const response = await this.apiClient.post('/food-businesses', businessPayload);
    
    if (response.isEmpty) {
      return { ...businessPayload, id: Date.now() };
    }
    
    if (response.data && response.data.id) {
      StorageHelper.saveBusinessForUser(businessData.userId, response.data.id);
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
      const menuResponse = await this.apiClient.get(`/menus/food-business/${business.id}`);
      business.menus = menuResponse.isEmpty ? [] : (
        Array.isArray(menuResponse.data) ? menuResponse.data : [menuResponse.data]
      );
    } catch (error) {
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
      
      try {
        const menuResponse = await this.apiClient.get(`/menus/food-business/${business.id}`);
        
        if (!menuResponse.isEmpty && menuResponse.data) {
          const menuData = menuResponse.data;
          
          if (!menuData.menuItems || !Array.isArray(menuData.menuItems)) {
            try {
              const menuItemsResponse = await this.apiClient.get(`/menu-items?menuId=${menuData.id}`);
              menuData.menuItems = !menuItemsResponse.isEmpty && Array.isArray(menuItemsResponse.data) 
                ? menuItemsResponse.data : [];
            } catch (error) {
              menuData.menuItems = [];
            }
          }
          
          business.menus = [menuData];
        }
      } catch (error) {
        business.menus = [];
      }
      
      return [business];
    } catch (error) {
      return [];
    }
  }
  
  async getCategories() {
    try {
      const response = await this.apiClient.get('/business-categories');
      return response.isEmpty ? [] : response.data;
    } catch (error) {
      return [];
    }
  }
  
  async getQRCode(businessId) {
    try {
      const blob = await this.apiClient.fetchBinary(`/food-businesses/${businessId}/qr-code`);
      return URL.createObjectURL(blob);
    } catch (error) {
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
    if (!menuData.name || !menuData.foodBusinessId) {
      throw new Error('El nombre del menú y el ID del negocio son requeridos');
    }
    
    const menuPayload = {
      name: menuData.name,
      description: menuData.description || '',
      foodBusinessId: parseInt(menuData.foodBusinessId, 10)
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
    } catch (error) {
      return { id, name: 'Menú no disponible', description: '', items: [] };
    }
  }
  
  validateMenuItem(menuItemData) {
    if (!menuItemData.name || !menuItemData.menuId || !menuItemData.price) {
      throw new Error('El nombre, precio y ID del menú son requeridos');
    }
    
    if (isNaN(parseFloat(menuItemData.price)) || parseFloat(menuItemData.price) <= 0) {
      throw new Error('El precio debe ser un número mayor que cero');
    }
  }
  
  prepareMenuItemPayload(menuItemData, imageKey = null) {
    return {
      name: menuItemData.name,
      description: menuItemData.description || '',
      price: parseFloat(menuItemData.price),
      menuId: menuItemData.menuId,
      isAvailable: menuItemData.isAvailable === undefined ? true : menuItemData.isAvailable,
      menuItemCategoryId: menuItemData.menuItemCategoryId || null,
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
      price: parseFloat(menuItemData.price),
      isAvailable: menuItemData.isAvailable === undefined ? true : menuItemData.isAvailable,
      menuItemCategoryId: menuItemData.menuItemCategoryId || null,
      ...(menuItemData.imageKey && { imageKey: menuItemData.imageKey })
    };
    
    Object.keys(payload).forEach(key => 
      payload[key] === undefined && delete payload[key]
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
    } catch (error) {
      return [];
    }
  }
  
  async getMenuItemCategories() {
    try {
      const response = await this.apiClient.get('/menu-item-categories');
      return response.isEmpty ? [] : response.data;
    } catch (error) {
      return [];
    }
  }
}

// Inicializar servicios
const apiClient = new ApiClient(API_URL);
const imageUploader = new ImageUploader(apiClient);
const businessService = new BusinessService(apiClient, imageUploader);
const menuService = new MenuService(apiClient, imageUploader);

// Exportar interfaz de servicio
export default {
  // Negocios
  createFoodBusiness: (data) => businessService.create(data),
  getFoodBusiness: (id) => businessService.getById(id),
  getUserBusinesses: (userId) => businessService.getByUserId(userId),
  getBusinessCategories: () => businessService.getCategories(),
  getBusinessQRCode: (id) => businessService.getQRCode(id),
  
  // Menús
  createMenu: (data) => menuService.create(data),
  getMenu: (id) => menuService.getById(id),
  
  // Platillos
  createMenuItem: (data) => menuService.createMenuItem(data),
  updateMenuItem: (itemId, data) => menuService.updateMenuItem(itemId, data),
  deleteMenuItem: (itemId) => menuService.deleteMenuItem(itemId),
  getMenuItems: (menuId) => menuService.getMenuItems(menuId),
  getMenuItemCategories: () => menuService.getMenuItemCategories(),
  
  // Imágenes
  uploadImage: (file) => imageUploader.upload(file),
  
  // Métodos de almacenamiento local (para compatibilidad)
  _saveBusinessIdForUser: (userId, businessId) => StorageHelper.saveBusinessForUser(userId, businessId),
  _getBusinessIdsForUser: (userId) => StorageHelper.getBusinessesForUser(userId)
}; 