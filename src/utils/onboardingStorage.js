/**
 * Utilidades para gestionar localStorage del onboarding
 */

const STORAGE_PREFIX = 'onboarding_progress_';
const EXPIRATION_DAYS = 7;

/**
 * Guarda el progreso del onboarding en localStorage
 */
export const saveOnboardingProgress = (userId, progressData) => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const dataToSave = {
      ...progressData,
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error al guardar progreso en localStorage:', error);
    return false;
  }
};

/**
 * Carga el progreso del onboarding desde localStorage
 */
export const loadOnboardingProgress = (userId) => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const saved = localStorage.getItem(key);
    
    if (!saved) {
      return null;
    }
    
    const progressData = JSON.parse(saved);
    const timestamp = progressData.timestamp || 0;
    const expirationTime = Date.now() - (EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    
    // Verificar si los datos no han expirado
    if (timestamp < expirationTime) {
      clearOnboardingProgress(userId);
      return null;
    }
    
    return progressData;
  } catch (error) {
    console.error('Error al cargar progreso desde localStorage:', error);
    return null;
  }
};

/**
 * Limpia el progreso del onboarding de localStorage
 */
export const clearOnboardingProgress = (userId) => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error al limpiar progreso de localStorage:', error);
    return false;
  }
};

/**
 * Verifica si existe progreso guardado
 */
export const hasOnboardingProgress = (userId) => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    return localStorage.getItem(key) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Limpia todos los datos de onboarding expirados
 */
export const cleanExpiredOnboardingData = () => {
  try {
    const expirationTime = Date.now() - (EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const keysToRemove = [];
    
    // Iterar sobre todas las claves de localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const timestamp = data.timestamp || 0;
          
          if (timestamp < expirationTime) {
            keysToRemove.push(key);
          }
        } catch {
          // Si hay error al parsear, eliminar la clave
          keysToRemove.push(key);
        }
      }
    }
    
    // Eliminar claves expiradas
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return keysToRemove.length;
  } catch (error) {
    console.error('Error al limpiar datos expirados:', error);
    return 0;
  }
};

/**
 * Establece el flag de que el usuario necesita onboarding
 */
export const setNeedsOnboarding = (userId) => {
  try {
    localStorage.setItem('needs_onboarding', 'true');
    if (userId) {
      localStorage.setItem('user_id', userId.toString());
    }
    return true;
  } catch (error) {
    console.error('Error al establecer flag de onboarding:', error);
    return false;
  }
};

/**
 * Verifica si el usuario necesita onboarding
 */
export const needsOnboarding = () => {
  try {
    return localStorage.getItem('needs_onboarding') === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Limpia el flag de onboarding necesario
 */
export const clearNeedsOnboarding = () => {
  try {
    localStorage.removeItem('needs_onboarding');
    return true;
  } catch (error) {
    console.error('Error al limpiar flag de onboarding:', error);
    return false;
  }
};

/**
 * Obtiene el tamaño aproximado de los datos de onboarding en localStorage
 */
export const getOnboardingStorageSize = (userId) => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return 0;
    }
    
    // Calcular tamaño en bytes (aproximado)
    return new Blob([data]).size;
  } catch (error) {
    return 0;
  }
};

/**
 * Comprime los datos si exceden cierto tamaño (5KB)
 */
export const compressOnboardingData = (data) => {
  const MAX_SIZE = 5 * 1024; // 5KB
  const dataString = JSON.stringify(data);
  
  if (new Blob([dataString]).size > MAX_SIZE) {
    // Eliminar campos opcionales vacíos para reducir tamaño
    const compressed = { ...data };
    
    Object.keys(compressed).forEach(key => {
      if (compressed[key] === '' || compressed[key] === null || compressed[key] === undefined) {
        delete compressed[key];
      }
    });
    
    return compressed;
  }
  
  return data;
};
