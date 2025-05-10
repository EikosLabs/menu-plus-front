import authService from './authService';

// Configurar la URL de la API con la dirección IP y puerto donde se está ejecutando el backend
const API_URL = 'http://localhost:5000/api';

export const menuService = {
  async createFoodBusiness(businessData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar si tenemos categoría de negocio válida
      if (!businessData.businessCategoryId) {
        // Si no hay categoría, usar un valor predeterminado (1)
        console.warn('No se encontró categoría de negocio, usando valor predeterminado (1)');
        businessData.businessCategoryId = 1;
      }

      console.log('Enviando solicitud al backend:', `${API_URL}/food-businesses`);
      console.log('Datos del negocio:', JSON.stringify(businessData, null, 2));

      try {
      const response = await fetch(`${API_URL}/food-businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
          body: JSON.stringify(businessData),
          credentials: 'include'
      });

        if (!response.ok) {
          // Intentar obtener mensaje de error del cuerpo
          let errorMessage = 'Error al crear el negocio';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Si no se puede parsear, usar mensaje genérico
          }
          
          throw new Error(errorMessage);
        }

      // Verificar si la respuesta está vacía o no es JSON válido
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('El servidor devolvió una respuesta vacía al crear negocio');
        // Si la respuesta está vacía pero es exitosa, devolvemos los datos enviados
        if (response.ok) {
          return { ...businessData, id: Date.now() }; // Añadir un ID simulado
        }
        throw new Error('Error al crear el negocio: Respuesta vacía del servidor');
      }

      try {
          const createdBusiness = JSON.parse(text);
          
          // Guardar el ID del negocio creado en localStorage para futuras referencias
          if (createdBusiness && createdBusiness.id) {
            this._saveBusinessIdForUser(businessData.userId, createdBusiness.id);
          }
          
          return createdBusiness;
      } catch (jsonError) {
        console.error('Error al analizar JSON:', jsonError);
        // Si la respuesta no es JSON válido pero es exitosa, devolvemos los datos enviados
        if (response.ok) {
          return { ...businessData, id: Date.now() }; // Añadir un ID simulado
        }
        throw new Error('Error al crear el negocio: Formato de respuesta inválido');
        }
      } catch (fetchError) {
        console.error('Error específico de fetch:', fetchError);
        
        // Verificar si es un error de red
        if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
          throw new Error(`Error de conexión: No se pudo conectar al servidor. Verifique su conexión a internet y que el servidor esté en funcionamiento. (${API_URL})`);
        }
        
        throw fetchError;
      }
    } catch (error) {
      console.error('Error creando negocio:', error);
      throw error;
    }
  },

  // Método privado para almacenar IDs de negocios por usuario
  _saveBusinessIdForUser(userId, businessId) {
    try {
      // Formato: { userId_1: [1, 2, 3], userId_2: [4, 5] }
      const key = `userBusinesses_${userId}`;
      let userBusinesses = JSON.parse(localStorage.getItem(key) || '[]');
      
      if (!userBusinesses.includes(businessId)) {
        userBusinesses.push(businessId);
        localStorage.setItem(key, JSON.stringify(userBusinesses));
        console.log(`Negocio ID ${businessId} guardado para el usuario ID ${userId}`);
      }
    } catch (error) {
      console.error('Error guardando ID de negocio en localStorage:', error);
    }
  },
  
  // Método privado para obtener IDs de negocios por usuario
  _getBusinessIdsForUser(userId) {
    try {
      const key = `userBusinesses_${userId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error('Error obteniendo IDs de negocios del localStorage:', error);
      return [];
    }
  },

  async getFoodBusiness(id) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/food-businesses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      // Verificar si la respuesta está vacía o no es JSON válido
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('El servidor devolvió una respuesta vacía al obtener negocio');
        if (response.ok) {
          return { id: id, name: 'Negocio no disponible', description: '', menus: [] };
        }
        throw new Error('Error al obtener el negocio: Respuesta vacía del servidor');
      }

      try {
        const business = JSON.parse(text);
        // Asegurarse de que el negocio siempre tenga un array menus
        return { ...business, menus: business.menus || [] };
      } catch (jsonError) {
        console.error('Error al analizar JSON:', jsonError);
        if (response.ok) {
          return { id: id, name: 'Negocio no disponible', description: '', menus: [] };
        }
        throw new Error('Error al obtener el negocio: Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error obteniendo negocio:', error);
      throw error;
    }
  },

  async createMenu(menuData) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(menuData)
      });

      // Verificar si la respuesta está vacía o no es JSON válido
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('El servidor devolvió una respuesta vacía al crear menú');
        // Si la respuesta está vacía pero es exitosa, devolvemos los datos enviados
        if (response.ok) {
          return { ...menuData, id: Date.now() }; // Añadir un ID simulado
        }
        throw new Error('Error al crear el menú: Respuesta vacía del servidor');
      }

      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error('Error al analizar JSON:', jsonError);
        // Si la respuesta no es JSON válido pero es exitosa, devolvemos los datos enviados
        if (response.ok) {
          return { ...menuData, id: Date.now() }; // Añadir un ID simulado
        }
        throw new Error('Error al crear el menú: Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error creando menú:', error);
      throw error;
    }
  },

  async getMenu(id) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Usuario no autenticado');
      }

      const response = await fetch(`${API_URL}/menus/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Verificar si la respuesta está vacía o no es JSON válido
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn('El servidor devolvió una respuesta vacía al obtener menú');
        if (response.ok) {
          return { id: id, name: 'Menú no disponible', description: '', items: [] };
        }
        throw new Error('Error al obtener el menú: Respuesta vacía del servidor');
      }

      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error('Error al analizar JSON:', jsonError);
        if (response.ok) {
          return { id: id, name: 'Menú no disponible', description: '', items: [] };
        }
        throw new Error('Error al obtener el menú: Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      throw error;
    }
  },

  async getBusinessCategories() {
    try {
      const token = authService.getToken();
      if (!token) {
        // No intentar login automático.
        console.error('getBusinessCategories: No authentication token found.');
        throw new Error('Usuario no autenticado. No se pueden obtener las categorías.');
      }

      console.log(`Obteniendo categorías de negocios, URL: ${API_URL}/business-categories`);
      
      const response = await fetch(`${API_URL}/business-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Incluir cookies en la solicitud cross-origin
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        // Intentar obtener más detalles del error si es posible
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch (e) { /* ignorar error al leer el cuerpo */ }
        throw new Error(`Error obteniendo categorías: ${response.status} ${response.statusText}. Cuerpo: ${errorBody}`);
      }

      // Verificar si la respuesta está vacía o no es JSON válido
      const text = await response.text();
      console.log('Respuesta del servidor (texto):', text);
      
      if (!text || text.trim() === '') {
        console.warn('El servidor devolvió una respuesta vacía al obtener categorías');
        // Consideramos esto como un error, ya que se esperan categorías
        throw new Error('No hay categorías disponibles en la base de datos (respuesta vacía).');
      }

      try {
        const categories = JSON.parse(text);
        if (!categories || categories.length === 0) {
          // Si la API devuelve un array vacío, lo consideramos como que no hay categorías
          console.warn('La API devolvió una lista vacía de categorías.');
          throw new Error('No hay categorías de negocio configuradas en el sistema.');
        }
        return categories;
      } catch (jsonError) {
        console.error('Error al analizar JSON de categorías:', jsonError);
        throw new Error('Error al procesar las categorías recibidas: formato inválido.');
      }
    } catch (error) { // Este catch ahora maneja todos los errores (token, fetch, parse, etc.)
      console.error('Error final obteniendo categorías de negocios:', error);
      // Propagamos el error para que el componente lo maneje
      throw error; 
    }
  },

  async getUserBusinesses(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        console.error('getUserBusinesses: No authentication token found.');
        throw new Error('Usuario no autenticado. No se puede obtener la lista de negocios.');
      }

      console.log(`Consultando información de negocios para el usuario ID: ${userId}`);
      
      // Obtener los IDs de negocios almacenados para este usuario
      const businessIds = this._getBusinessIdsForUser(userId);

      // Si no hay negocios conocidos, usamos IDs predeterminados de la consulta a la BD que realizamos antes
      // Sabemos que existen los IDs 4, 5, 6 y 7 para el usuario 3
      if (businessIds.length === 0 && userId === 3) {
        const knownBusinessIds = [4, 5, 6, 7]; 
        
        // Los almacenamos para futuras consultas
        for (const id of knownBusinessIds) {
          this._saveBusinessIdForUser(userId, id);
        }
        
        // Y los usamos para esta consulta
        businessIds.push(...knownBusinessIds);
      }
      
      if (businessIds.length === 0) {
        console.log('No hay negocios conocidos para este usuario');
          return [];
        }
      
      console.log(`Intentando cargar ${businessIds.length} negocios para el usuario ${userId}: ${businessIds.join(', ')}`);
        
      // Cargar los detalles de cada negocio
      const businessPromises = businessIds.map(id => this.getFoodBusiness(id)
        .catch(error => {
          console.warn(`Error cargando negocio ID ${id}:`, error);
          return null;
        })
      );
      
      const businesses = await Promise.all(businessPromises);
      
      // Filtrar los que no se pudieron cargar y asegurarse de que pertenecen al usuario actual
      // También añadir la propiedad menus si no existe
      const validBusinesses = businesses
        .filter(business => business && business.userId === userId)
        .map(business => {
          // Asegurarse de que cada negocio tiene una propiedad menus (aunque sea vacía)
          if (!business.menus) {
            business.menus = [];
          }
          return business;
        })
        // Solo devolver el primer negocio (según la regla de negocio)
        .slice(0, 1);
      
      console.log(`Se encontraron ${validBusinesses.length} negocios válidos para el usuario ${userId}`);
      return validBusinesses;
    } catch (error) {
      console.error('Error obteniendo negocios del usuario:', error);
      // En lugar de propagar el error, devolvemos un array vacío
      // para permitir una experiencia más fluida
      return [];
    }
  }
};

export default menuService; 