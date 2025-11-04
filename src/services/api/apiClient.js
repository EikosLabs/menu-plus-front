/**
 * Cliente API centralizado
 * Maneja todas las peticiones HTTP con timeout y manejo de errores
 */

import authService from '../authService.js';
import {
  createAbortController,
  parseResponse,
  assertResponseOk,
  createAuthHeaders,
  handleFetchError
} from '../../utils/httpHelpers.js';

const DEFAULT_TIMEOUT = 10000;
const BINARY_TIMEOUT = 15000;

export class ApiClient {
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
    const { method = 'GET', body = null, timeout = DEFAULT_TIMEOUT } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const { controller, timeoutId } = createAbortController(timeout);

    try {
      const token = this.getAuthToken();
      const headers = createAuthHeaders(token,
        body ? { 'Content-Type': 'application/json' } : {}
      );

      const fetchOptions = {
        method,
        headers,
        credentials: 'include',
        signal: controller.signal,
        ...(body && { body: JSON.stringify(body) })
      };

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const { data, isEmpty } = await parseResponse(response);
      assertResponseOk(response, data);

      return { data, status: response.status, isEmpty };
    } catch (error) {
      return handleFetchError(error, timeoutId);
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

  async patch(endpoint, data, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'PATCH', body: data });
  }

  async delete(endpoint, options = {}) {
    return this.makeRequest(endpoint, { ...options, method: 'DELETE' });
  }

  async fetchBinary(endpoint, options = {}) {
    const { timeout = BINARY_TIMEOUT } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const { controller, timeoutId } = createAbortController(timeout);

    try {
      const token = this.getAuthToken();

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      return handleFetchError(error, timeoutId);
    }
  }
}

const API_URL = import.meta.env.PUBLIC_API_URL || '/api';
export const apiClient = new ApiClient(API_URL);
