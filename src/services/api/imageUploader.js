/**
 * Servicio de subida de imágenes
 * Maneja la carga de archivos al servidor
 */

import { createAbortController, handleFetchError } from '../../utils/httpHelpers.js';

const UPLOAD_TIMEOUT = 30000;

export class ImageUploader {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.endpoint = '/images';
  }

  async upload(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append('File', file);

    const token = this.apiClient.getAuthToken();
    const { controller, timeoutId } = createAbortController(UPLOAD_TIMEOUT);

    try {
      const response = await fetch(`${this.apiClient.baseUrl}${this.endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Error al subir imagen: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.key || data.Key || data;
    } catch (error) {
      return handleFetchError(error, timeoutId);
    }
  }
}
