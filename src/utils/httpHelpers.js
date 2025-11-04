/**
 * Utilidades HTTP compartidas
 * Manejo centralizado de errores y timeouts
 */

/**
 * Configuración por defecto para requests
 */
export const HTTP_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

/**
 * Crea un AbortController con timeout
 * @param {number} timeout - Timeout en milisegundos
 * @returns {Object} { controller, timeoutId }
 */
export const createAbortController = (timeout = HTTP_CONFIG.timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

/**
 * Parsea respuesta HTTP manejando diferentes formatos
 * @param {Response} response - Respuesta de fetch
 * @returns {Promise<Object>} { data, isEmpty }
 */
export const parseResponse = async (response) => {
  const responseText = await response.text();
  let data = null;

  if (responseText?.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        throw new Error(`Error: ${responseText}`);
      }
      data = responseText;
    }
  }

  return {
    data,
    isEmpty: !responseText || responseText.trim() === ''
  };
};

/**
 * Extrae mensaje de error de respuesta HTTP
 * @param {Response} response - Respuesta de fetch
 * @param {*} data - Datos parseados de la respuesta
 * @returns {string} Mensaje de error
 */
export const extractErrorMessage = (response, data) => {
  if (data && typeof data === 'object') {
    return data.message || data.error || `Error ${response.status}: ${response.statusText}`;
  }
  return `Error ${response.status}: ${response.statusText}`;
};

/**
 * Maneja errores de fetch incluyendo timeouts y errores de red
 * @param {Error} error - Error capturado
 * @param {number} timeoutId - ID del timeout a limpiar
 * @returns {never} Lanza el error procesado
 */
export const handleFetchError = (error, timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (error.name === 'AbortError') {
    throw new Error('La operación excedió el tiempo límite. Intente nuevamente.');
  }

  throw error;
};

/**
 * Verifica si el response es exitoso o lanza error con mensaje descriptivo
 * @param {Response} response - Respuesta de fetch
 * @param {*} data - Datos parseados
 * @throws {Error} Si la respuesta no es exitosa
 */
export const assertResponseOk = (response, data) => {
  if (!response.ok) {
    const message = extractErrorMessage(response, data);
    throw new Error(message);
  }
};

/**
 * Crea headers con autorización
 * @param {string} token - Token de autenticación
 * @param {Object} additionalHeaders - Headers adicionales
 * @returns {Object} Headers object
 */
export const createAuthHeaders = (token, additionalHeaders = {}) => {
  return {
    Authorization: `Bearer ${token}`,
    ...additionalHeaders
  };
};

/**
 * Wrapper para fetch con manejo de errores y timeout
 * @param {string} url - URL a llamar
 * @param {Object} options - Opciones de fetch
 * @param {number} timeout - Timeout en ms
 * @returns {Promise<Object>} { data, status, isEmpty }
 */
export const fetchWithTimeout = async (url, options = {}, timeout = HTTP_CONFIG.timeout) => {
  const { controller, timeoutId } = createAbortController(timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const { data, isEmpty } = await parseResponse(response);
    assertResponseOk(response, data);

    return {
      data,
      status: response.status,
      isEmpty
    };
  } catch (error) {
    return handleFetchError(error, timeoutId);
  }
};
