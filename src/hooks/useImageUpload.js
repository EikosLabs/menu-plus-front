/**
 * Hook personalizado para manejo de subida de imágenes
 * Centraliza la lógica de validación y preview de imágenes
 */

import { useState } from 'react';
import { validateImageFile, readFileAsDataURL } from '../utils/validators.js';

export const useImageUpload = (options = {}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) {
      reset();
      return;
    }

    // Validar archivo
    const validation = validateImageFile(selectedFile, options);
    if (!validation.isValid) {
      setError(validation.error);
      reset();
      return;
    }

    setFile(selectedFile);

    // Generar preview
    try {
      const dataUrl = await readFileAsDataURL(selectedFile);
      setPreview(dataUrl);
    } catch (err) {
      setError('Error al cargar la imagen');
      reset();
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const clearFileInput = (inputId) => {
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return {
    file,
    preview,
    error,
    isUploading,
    setIsUploading,
    handleFileChange,
    reset,
    clearFileInput
  };
};
