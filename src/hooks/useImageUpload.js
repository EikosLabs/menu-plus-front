import { useState } from 'react';
import { FILE_SIZE } from '../constants';

/**
 * Custom hook for handling image upload functionality
 * Manages file selection, preview generation, and validation
 */
export const useImageUpload = (maxSize = FILE_SIZE.IMAGE_MAX) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const validateImage = (file) => {
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return 'Formato de imagen inválido. Use JPG, PNG, GIF o WebP.';
    }
    if (file.size > maxSize) {
      return `La imagen no debe superar ${(maxSize / 1024 / 1024).toFixed(1)}MB.`;
    }
    return null;
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationError = validateImage(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return {
    file,
    preview,
    error,
    handleImageChange,
    clearImage,
    setPreview,
  };
};
